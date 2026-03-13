// controllers/pageController.js

exports.getHome = (req, res) => {
    res.render('home');
};

exports.getAbout = (req, res) => {
    res.render('about');
};

exports.getContact = (req, res) => {
    res.render('contact');
};