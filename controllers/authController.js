const authService = require("../services/authService.js");

async function signUpHandler(req, res) {
  try {
    const { username, email, password } = req.body;

    await authService.signUp(username, email, password);

    // After successful signup, send them to login page
    return res.redirect("/login");
  } catch (err) {
    console.error(err);
    return res.status(400).render("login", {
      error: err.message || "Registration failed",
    });
  }
}

async function logInHandler(req, res) {
  try {
    const { email, password } = req.body;

    const { accessToken } = await authService.logIn(email, password);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.redirect("/profile");
  } catch (err) {
    console.error(err);
    return res.status(401).render("login", {
      error: "Invalid email or password",
    });
  }
}

//Logs user out by clearing auth token, then sending them to the login page
//Handles errors by returning 400 BAD REQUEST to user
async function logOutHandler(req, res) {
  try {
    res.clearCookie("accessToken");
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(400);
  }
}
module.exports = { signUpHandler, logInHandler, logOutHandler };