module.exports = {
	signUp: (req, res, next) => {
		return res.status(200).json(req.value['body']);
	}
}