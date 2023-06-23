import { userModel as user } from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import { generateToken } from "../config/jwToken.js";
import { validatemongodbId } from "../utils/validatemongodbId.js";
import { generaterrefreshToken } from "../config/refreshToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "./emailController.js";
import { productModel as Product } from "../models/productModel.js";
import { queryModel } from "../models/queryModel.js";
import { accessSync } from "fs";

//  create user
export const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const finduser = await user.find({ email: email });
  if (finduser.length == 0) {
    const newuser = await user.create(req.body);
    res.json({
      message: "successfully created",
    });
  } else {
    res.json({
      message: "user alerady exists",
    });
  }
});

//  login user
export const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findUser = await user.findOne({ email });
  if (findUser != null) {
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generaterrefreshToken(findUser?._id);
      const updateuser = await user.findByIdAndUpdate(
        findUser.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        message: "successfully logged",
        token: refreshToken,
        role: findUser.role
      });
    } else {
      res.json({
        message: "invalid crediential",
      });
    }
  } else {
    res.json({
      message: "no user found",
    });
  }
});

export const handlerefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const users = await user.findOne({ refreshToken });
  // res.json(uses);
  if (!users) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.jwt_secret, (err, decoded) => {
    if (err || users.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(users?._id);
    res.json({ accessToken });
  });
});

// logout function
export const logOut = asyncHandler(async (req, res) => {
  const refreshToken = req.headers.token;
  const users = await user.findOne({ refreshToken });
  await user.findOneAndUpdate({ refreshToke: refreshToken }, {
    refreshToken: "",
  });
  res.json({
    message: "successfully log-out",
  });
});

export const updatepassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validatemongodbId(_id);
  const user = await user.findById(_id);
  if (password) {
    user.password = password;
    const updatePassword = await user.save();
    res.json(updatePassword);
  } else {
    res.json(user);
  }
});

export const forgetPasswordtoken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user_details = await user.findOne({ email });

  if (!user_details) {
    res.json({
      message: "you are not a registered user",
    });
  }
  try {
    const token = await user_details.createpasswordResetToken();
    await user_details.save();
    const appUrl = req.get("origin");
    const resetURL = `<a href="${appUrl}/reset-password/${token}">click here</a>`;
    const data = {
      to: email,
      subject: "E Rental App - Reset Password Link",
      html: `Please ${resetURL} to create new password.`,
    };
    sendEmail(data);
    res.json({
      message: "mail sent",
    });
  } catch (err) {
    throw new Error(err);
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user_details = await user.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user_details) {
    res.json({
      message: "Token expired",
    });
  } else {
    user_details.password = password;
    user_details.passwordResetToken = undefined;
    user_details.passwordResetExpires = undefined;
    await user_details.save();
    res.json({
      message: "successfully updated",
    });
  }
});

export const validateToken = asyncHandler(async (req, res) => {
  try {
    const { role } = req.user;

    res.json({
      token: "verified",
      role: role
    });

  } catch (err) {
    throw new Error(err);
  }
});

export const getCart = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { cart } = await user.findById(_id);
    res.json({
      cart: cart.length
    })
  } catch (error) {
    res.json({
      message: error
    })
  }
});


export const getCartItem = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { cart } = await user.findById(_id);
    const totalPrice = cart.reduce((total, item) => total + item.totalPrice, 0);
    res.json({
      cart: cart,
      totalPrice: totalPrice
    })
  } catch (error) {
    res.json({
      message: error
    })
  }
});

export const getUserDetails = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const userDetails = await user.findById(_id);
    res.json(userDetails);
  } catch (error) {
    res.json(error)
  }
});

export const updateAddress = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const users = await user.findByIdAndUpdate({ _id: id }, { address: req.body });
    res.json(users);
  } catch (error) {
    res.json(error)

  }
})
export const addCart = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId } = req.body;
    // get product 
    // check already exists or not 
    const { cart } = await user.findById(_id);
    const existsProduct = cart.filter((item) => item.id == productId);

    if (existsProduct.length) {
      res.json({
        message: "Already added"
      })
    }
    else {
      const { id, price, image, description, title } = await Product.findById(productId);
      const date = new Date();
      const cartItem = {
        id: id,
        price: price,
        image: image.url,
        description: description,
        startTime: "00:00",
        endTime: "00:00",
        startDate: (new Date()).toJSON().slice(0, 10),
        endDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1}`,
        title: title,
        quantity: 1,
      }
      const total = Math.abs(Math.round(((((new Date(`${cartItem.startDate} ${cartItem.startTime}`)).getTime()) - ((new Date(`${cartItem.endDate} ${cartItem.endTime}`)).getTime())) / 1000) / 3600)) * cartItem.price * cartItem.quantity;
      cartItem.totalPrice = total;
      // add cart
      const { cart } = await user.findById(_id);
      const users = await user.findByIdAndUpdate(_id,
        { $push: { cart: cartItem } });
      res.json({
        message: "Added Successfully"
      })
    }
  } catch (error) {
    res.json({
      message: error
    })
  }
})

export const updateCartItem = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const { element, productId, value } = req.body;

  let message = "";
  // find product available or not 
  if (element == "quantity") {
    const { quantity } = await Product.findById(productId);
    if (quantity >= value) {
      const update = await user.updateOne({ "cart.id": productId }, { $set: { "cart.$.quantity": value } })
      message = "updated successfully"
    }
    else {
      message = "quantity is less"
    }
  }
  else if (element == "startTime") {
    const update = await user.updateOne({ "cart.id": productId }, { $set: { "cart.$.startTime": value } })
    message = "updated successfully"
  }
  else if (element == "endTime") {
    const update = await user.updateOne({ "cart.id": productId }, { $set: { "cart.$.endTime": value } })
    message = "updated successfully"
  }
  else if (element == "startDate") {
    const update = await user.updateOne({ "cart.id": productId }, { $set: { "cart.$.startDate": new Date(value).toJSON().slice(0, 10) } })
    message = "  updated successfully"
  }
  else if (element == "endDate") {
    const update = await user.updateOne({ "cart.id": productId }, { $set: { "cart.$.endDate": new Date(value).toJSON().slice(0, 10) } })
    message = "updated successfully"
  };
  const { cart } = await user.findById(_id);
  const find = cart.filter((item) => item.id == productId);
  const { title, price, startDate, endDate, startTime, endTime, quantity } = find[0];
  const total = Math.abs(Math.round(((((new Date(`${startDate} ${startTime}`)).getTime()) - ((new Date(`${endDate} ${endTime}`)).getTime())) / 1000) / 3600)) * price * quantity;
  await user.updateOne({ "cart.id": productId }, { $set: { "cart.$.totalPrice": total } });

  res.json({
    message: message
  })
})


export const queryMessage = asyncHandler(async (req, res) => {
  try {
    const queryDetails = req.body;
    const { id } = req.user;
    queryDetails.userId = id;
    const addQuery = await queryModel.create(req.body);
    const { name, email, mobile, query } = req.body;
    const data = {
      to: "vigneshthanika03@gmail.com",
      subject: "E Rental App - Query request",
      html: `
      <ul style="list-style-type:none">
      <li><b>Name</b> : ${name}</li>
      <li><b>Email</b> : ${email}</li>
      <li><b>Mobile</b> : ${mobile}</li>
      <li><b>Query</b> : ${query}</li>
      </ul>
      `,
    };
    sendEmail(data);
    res.json({
      message: "successfully sent"
    })
  } catch (err) {
    res.json(err)
  }
})

// portfolio mail
export const queryMessageWithoutId = asyncHandler(async (req, res) => {
  try {
    const queryDetails = req.body;
    const { name, email, mobile, query } = req.body;
    const data = {
      to: "vigneshthanika03@gmail.com",
      subject: "Contact Form Submission - Portfolio",
      html: `
      <ul style="list-style-type:none">
      <li><b>Name</b> : ${name}</li>
      <li><b>Email</b> : ${email}</li>
      <li><b>Mobile</b> : ${mobile}</li>
      <li><b>Query</b> : ${query}</li>
      </ul>
      `,
    };
    sendEmail(data);
    res.json({
      message: "successfully sent"
    })
  } catch (err) {
    res.json(err)
  }
})
