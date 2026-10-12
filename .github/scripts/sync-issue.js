// Two-way issue sync between the public release repo and the private main repo.
// Runs on both sides. SIDE tells which side this run is on. PEER_REPO is the other repo.
module.exports = async ({ github, context, core }) => {
  const owner = context.repo.owner;
  const self = context.repo.repo;
  const side = process.env.SIDE;
  const peer = process.env.PEER_REPO;
  const publicRepo = side === 'public' ? self : peer;
  const payload = context.payload;
  const issue = payload.issue;

  // App writes fire events on the other side. Skip them to stop loops.
  if (payload.sender?.type === 'Bot') return core.info('Skip: bot event');
  if (issue.pull_request) return core.info('Skip: pull request');

  const LABEL = 'from-public';
  const BODY_MARK = '<!-- mirror-body -->';
  const issueMark = (n) => `<!-- public-issue: ${owner}/${publicRepo}#${n} -->`;
  const commentMark = (id) => `<!-- mirror-comment: ${id} -->`;

  const toPrivateTitle = (t, n) => `[public #${n}] ${t}`;
  const toPublicTitle = (t) => t.replace(/^\[public #\d+\]\s*/, '');
  const toPrivateBody = (body, n, url, author) =>
    [issueMark(n), `**Source:** ${url}`, `**Reported by:** @${author}`, '', BODY_MARK, body || ''].join('\n');
  const toPublicBody = (body) => {
    const i = (body || '').indexOf(BODY_MARK);
    return i < 0 ? body || '' : body.slice(i + BODY_MARK.length).replace(/^\n/, '');
  };
  const wrapComment = (c) => `${commentMark(c.id)}\n**@${c.user.login}** wrote:\n\n${c.body || ''}`;
  const isMirrorComment = (body) => /^<!-- mirror-comment: \d+ -->/.test(body || '');

  async function findPeerIssue() {
    if (side === 'private') {
      const m = (issue.body || '').match(/<!-- public-issue: [^#]+#(\d+) -->/);
      return m ? Number(m[1]) : null;
    }
    const mark = issueMark(issue.number);
    const list = await github.paginate(github.rest.issues.listForRepo, {
      owner, repo: peer, labels: LABEL, state: 'all', per_page: 100,
    });
    const hit = list.find((i) => (i.body || '').startsWith(mark));
    return hit ? hit.number : null;
  }

  async function findPeerComment(peerNumber, sourceId) {
    const mark = commentMark(sourceId);
    const list = await github.paginate(github.rest.issues.listComments, {
      owner, repo: peer, issue_number: peerNumber, per_page: 100,
    });
    return list.find((c) => (c.body || '').startsWith(mark)) || null;
  }

  async function ensureLabel(label) {
    try {
      await github.rest.issues.getLabel({ owner, repo: peer, name: label.name });
    } catch (e) {
      if (e.status !== 404) throw e;
      await github.rest.issues.createLabel({
        owner, repo: peer, name: label.name, color: label.color, description: label.description || undefined,
      });
    }
  }

  async function ensureMilestone(ms) {
    const list = await github.paginate(github.rest.issues.listMilestones, {
      owner, repo: peer, state: 'all', per_page: 100,
    });
    const hit = list.find((m) => m.title === ms.title);
    if (hit) return hit.number;
    const res = await github.rest.issues.createMilestone({
      owner, repo: peer, title: ms.title, description: ms.description || undefined, due_on: ms.due_on || undefined,
    });
    return res.data.number;
  }

  const event = context.eventName;
  const action = payload.action;

  if (event === 'issues' && action === 'opened') {
    if (side !== 'public') return core.info('Skip: private-origin issue');
    if (await findPeerIssue()) return core.info('Skip: mirror exists');
    const res = await github.rest.issues.create({
      owner, repo: peer,
      title: toPrivateTitle(issue.title, issue.number),
      body: toPrivateBody(issue.body, issue.number, issue.html_url, issue.user.login),
      labels: [LABEL],
    });
    await github.rest.issues.createComment({
      owner, repo: self, issue_number: issue.number,
      body: 'Thanks for the report. This has been queued for triage.',
    });
    return core.info(`Created ${peer}#${res.data.number}`);
  }

  const peerNumber = await findPeerIssue();
  if (!peerNumber) return core.info('Skip: no mirror');

  if (event === 'issues') {
    if (action === 'edited') {
      const data = side === 'public'
        ? { title: toPrivateTitle(issue.title, issue.number),
            body: toPrivateBody(issue.body, issue.number, issue.html_url, issue.user.login) }
        : { title: toPublicTitle(issue.title), body: toPublicBody(issue.body) };
      await github.rest.issues.update({ owner, repo: peer, issue_number: peerNumber, ...data });
    } else if (action === 'closed' || action === 'reopened') {
      await github.rest.issues.update({
        owner, repo: peer, issue_number: peerNumber,
        state: issue.state, state_reason: issue.state_reason ?? undefined,
      });
    } else if (action === 'labeled' || action === 'unlabeled') {
      const name = payload.label.name;
      if (name === LABEL) return core.info('Skip: sync label');
      if (action === 'labeled') {
        await ensureLabel(payload.label);
        await github.rest.issues.addLabels({ owner, repo: peer, issue_number: peerNumber, labels: [name] });
      } else {
        await github.rest.issues.removeLabel({ owner, repo: peer, issue_number: peerNumber, name })
          .catch((e) => { if (e.status !== 404) throw e; });
      }
    } else if (action === 'assigned' || action === 'unassigned') {
      // Peer repo silently drops users without access. Warn so it is visible.
      const login = payload.assignee.login;
      const fn = action === 'assigned' ? github.rest.issues.addAssignees : github.rest.issues.removeAssignees;
      const res = await fn({ owner, repo: peer, issue_number: peerNumber, assignees: [login] });
      const has = res.data.assignees.some((a) => a.login === login);
      if (has !== (action === 'assigned')) core.warning(`@${login} cannot be assigned on ${peer}`);
    } else if (action === 'milestoned' || action === 'demilestoned') {
      const milestone = action === 'milestoned' ? await ensureMilestone(payload.milestone) : null;
      await github.rest.issues.update({ owner, repo: peer, issue_number: peerNumber, milestone });
    } else if (action === 'locked' || action === 'unlocked') {
      if (action === 'locked') {
        await github.rest.issues.lock({ owner, repo: peer, issue_number: peerNumber, lock_reason: issue.active_lock_reason || undefined });
      } else {
        await github.rest.issues.unlock({ owner, repo: peer, issue_number: peerNumber });
      }
    } else if (action === 'deleted') {
      await github.rest.issues.createComment({
        owner, repo: peer, issue_number: peerNumber, body: 'The linked issue was deleted. Closing.',
      });
      await github.rest.issues.update({ owner, repo: peer, issue_number: peerNumber, state: 'closed', state_reason: 'not_planned' });
    }
    return core.info(`Synced issues.${action} to ${peer}#${peerNumber}`);
  }

  if (event === 'issue_comment') {
    const c = payload.comment;
    if (isMirrorComment(c.body)) return core.info('Skip: mirrored comment');
    if (side === 'private' && /^\[internal\]/i.test(c.body || '')) return core.info('Skip: internal');

    if (action === 'created') {
      await github.rest.issues.createComment({ owner, repo: peer, issue_number: peerNumber, body: wrapComment(c) });
    } else {
      const existing = await findPeerComment(peerNumber, c.id);
      if (!existing) return core.info('Skip: no mirrored comment');
      if (action === 'edited') {
        await github.rest.issues.updateComment({ owner, repo: peer, comment_id: existing.id, body: wrapComment(c) });
      } else if (action === 'deleted') {
        await github.rest.issues.deleteComment({ owner, repo: peer, comment_id: existing.id });
      }
    }
    return core.info(`Synced issue_comment.${action} to ${peer}#${peerNumber}`);
  }
};
