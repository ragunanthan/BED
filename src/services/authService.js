import { dbconnect } from "../dbConnection.js";


const getUser = async (email) => {
  const [user] = await dbconnect.execute("SELECT * FROM user WHERE email = ?", [
    email,
  ]);

  if (user[0])
    return {
      success: true,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        password: user[0].password,
      },
    };
  else
    return {
      success: false,
    };
};

const getToken = async (userID) => {
  const [tokenArray] = await dbconnect.execute(
    "SELECT token FROM token WHERE user_id = ?",
    [userID]
  );
  if (tokenArray[0])
    return {
      success: true,
      token: tokenArray[0],
    };
  else
    return {
      success: false,
    };
};
const deleteExistingToken = async (userId) => {
  try {
    const [userArray] = await getToken(userId);
    if (userArray[0]) {
      await dbconnect.execute("DELETE FROM token WHERE user_id = ?", [
        parseInt(userId),
      ]);
      return true;
    } else return true;
  } catch (error) {
    return false;
  }
};

const saveRefreshToken = async (userId, refreshToken) => {
  await dbconnect.execute("INSERT INTO token (user_id, token) VALUES (?, ?)", [
    userId,
    refreshToken,
  ]);
};

const saveUser = async (userName, email, hashPassword) =>
  await dbconnect.execute(
    "INSERT INTO user (name, email, password) VALUES (?, ?, ?)",
    [userName, email, hashPassword]
  );

const erroHandler =
  (callBackFunction) =>
  async (...args) => {
    try {
      const result = await callBackFunction(...args);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  };

export default function authService() {
  return {
    getUser: erroHandler(getUser),
    deleteExistingToken: erroHandler(deleteExistingToken),
    getToken: erroHandler(getToken),
    saveRefreshToken: erroHandler(saveRefreshToken),
    saveUser: erroHandler(saveUser),
  };
}
