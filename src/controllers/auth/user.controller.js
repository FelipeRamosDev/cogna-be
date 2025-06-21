module.exports = async function(req, res) {
   res.status(200).send({ success: true, user: req.session.user || null });
}
