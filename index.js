// LOAD TEMPLATES ==============================================================

const TMPL_FN = {}
async function render(templateName, options) {
  if (!TMPL_FN[templateName])
    TMPL_FN[templateName] = await loadTemplate(templateName)
  return TMPL_FN[templateName](options)
}

async function loadTemplate(name) {
  const templateRes = await axios.get(`./templates/${name}.html`)
  return doT.template(templateRes.data)
}

// DEFINE ROUTES ===============================================================

const root = document.getElementById('root')

var router = Router({

  '/r/:subreddit': async function(subreddit) {
    const url = `https://www.reddit.com/r/${subreddit}.json`
    const result = await axios.get(url)
    const children = result.data.data.children
    const html = await render('list', {listItems: children})
    root.innerHTML = html
  },

  '/r/:subreddit/comments/((\w|.)*)': async function(subreddit, subPath) {
    const result = await axios.get(`https://www.reddit.com/r/${subreddit}/comments/${subPath.slice(0,-1)}.json`)
    const comments = result.data[1].data.children.map(flatten)
    const html = await render('comments', {comments: comments})
    root.innerHTML = html
  },

  '/((\w|.)*)': function(path) {
    throw new Error(`${path} is not yet handled!`)
  }
})

router.init()

// HELPERS =====================================================================

function flatten(comment) {
  replies = []
  _flatten = (comment) => {
    if (!comment) return
    if (comment.data.body) replies.push(convertLinks(comment.data.body))
    _flatten(_.get(comment, 'data.replies.data.children[0]'))
  }
  _flatten(comment)
  return replies
}

function convertLinks(string) {
  return string.replace(/\[.+?\]\(.+?\)/g, (section) => {
    var name = section.match(/\[(.+)\]/)[1]
    var link = section.match(/\((.+)\)/)[1]
    return `<a href="${link}">${name}</a>`
  })
}
