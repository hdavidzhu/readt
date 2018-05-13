Promise.all([
  axios.get('./templates/comments.html'),
  axios.get('./templates/list.html')
]).then(([commentsRes, listRes]) => {
  window.templates = {
    comments: commentsRes.data,
    list: listRes.data
  }

  function getQuery() {
    var search = location.search.substring(1)
    return JSON.parse(
      '{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
      (key, value) => key === "" ? value : decodeURIComponent(value)
    )
  }
  const href = window.location.href
  const url = `https://www.reddit.com/r/${getQuery().r}.json`

  axios.get(url).then((result) => {
    console.log(window.location.href)
    const children = result.data.data.children
    const templateFunction = doT.template(window.templates.list)
    const html = templateFunction({listItems: children})
    const root = document.getElementById('root')
    root.innerHTML = html
  })
})

function goToComment(ref, url) {
  axios.get(`https://www.reddit.com${url.slice(0,-1)}.json`).then((result) => {
    const comments = result.data[1].data.children.map(flatten)
    const templateFunction = doT.template(window.templates.comments)
    const html = templateFunction({comments: comments})
    const root = document.getElementById('root')
    root.innerHTML = html
  })
}

function flatten(comment) {
  replies = []
  _flatten = (comment) => {
    if (!comment) return
    console.log(comment)
    replies.push(comment.data.body)
    _flatten(_.get(comment, 'data.replies.data.children[0]'))
  }
  _flatten(comment)
  return replies
}
