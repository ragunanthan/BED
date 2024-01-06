import jwt from "jsonwebtoken";

export const auth = async (req, res, next) => {
	const token = req?.headers?.authorization?.split(' ')[1]; 
	if (!token)
		return res
			.status(403)
			.json({ error: true, message: "Access Denied: No token provided" });

	try {
		const tokenDetails = jwt.verify(
			token,
			process.env.ACCESS_TOKEN_PRIVATE_KEY
		);
		req.user = tokenDetails;
		next();
	} catch (err) {
		console.log("token expired",{err});
		res
			.status(403)
			.json({ error: true, message: "Access Denied: Invalid token" });
	}
};


