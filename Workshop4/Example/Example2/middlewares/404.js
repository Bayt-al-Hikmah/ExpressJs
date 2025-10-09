module.exports = (req, res) => {
const username = req.session.user?.username || null;
  res.status(404).render('404', {
    username:username,
    messages:[{ category: 'danger', message: 'Page don\'t exist' }],
    title: 'Page Not Found',
    url: req.originalUrl
  });
};