export const googleAuth = (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?...`;

  res.redirect(url);
};

export const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    // exchange code → accessToken
    const accessToken = await getAccessTokenFromGoogle(code);

    const result = await googleLogin(accessToken);

    res.json(result);
  } catch (err) {
    next(err);
  }
};