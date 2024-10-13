export const signUp = (req, res) => {
  res.json({
    data: "you are in signup endpoint",
  });
};

export const login = (req, res) => {
  res.json({
    data: `you're at login endpoint`,
  });
};

export const logout = (req, res) => {
  res.json({ data: `you're in logout endpoint` });
};
