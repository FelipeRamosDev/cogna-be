module.exports = async function(req, res) {
   res.status(200).send({ user: req.session.user || null });
}
