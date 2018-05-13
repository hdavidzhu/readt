Promise.all([
  axios.get('./templates/list.html')
]).then((templateResults) => {
  const href = window.location.href
  const url = `https://www.reddit.com/r/${getQuery().r}.json`
  axios.get(url).then((result) => {
    console.log(window.location.href)
    const children = result.data.data.children
    const templateFunction = doT.template(templateResults[0].data)
    const html = templateFunction({listItems: children})
    const root = document.getElementById('root')
    root.innerHTML = html
  })
})

function getQuery() {
  var search = location.search.substring(1)
  return JSON.parse(
    '{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
    (key, value) => key === "" ? value : decodeURIComponent(value)
  )
}

function goToComment(ref, url) {
  console.log(url)
}
