const requireLogin = async (req, res, next) => {
    const username = req.session.user?.username || null;
    if (!username) {
        req.session.messages = [
            { category: 'danger', message: 'You must be logged in to access this page.' }
        ];
        await req.session.save();
        return res.redirect('/login');
    }
    next();
};

module.exports = requireLogin;