/**
 * 描述: 用户路由模块
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const service = require('../services/userService');


// 登录/注册校验
const vaildator = [
  body('username').isString().withMessage('用户名类型错误'),
  body('password').isString().withMessage('密码类型错误')
]

// const vaildator = [
//   body('username').isString().withMessage('用户名类型错误'),
//   body('password').isString().withMessage('密码类型错误')
// ]
const emailVaildator = [
  body('email').isString().withMessage('邮箱类型错误')
]

const forgetPwdVaildator = [
  body('email').isString().withMessage('用户名类型错误'),
  body('code').isString().withMessage('验证码类型错误'),
  // body('Password').isString().withMessage('密码类型错误'),
  // body('Password1').isString().withMessage('密码类型错误')
]

const phoneVaildator = [
  body('phone').isString().withMessage('手机号码类型错误')
]

// 重置密码校验
const resetPwdVaildator = [
  body('username').isString().withMessage('用户名类型错误'),
  body('oldPassword').isString().withMessage('密码类型错误'),
  body('newPassword').isString().withMessage('密码类型错误')
]

const regisrerVaildator = [
  body('username').isString().withMessage('用户名类型错误'),
  body('password').isString().withMessage('密码类型错误'),
  body('phone').isString().withMessage('密码类型错误'),
  body('name').isString().withMessage('密码类型错误'),
  body('email').isString().withMessage('密码类型错误')
]

// 用户登录路由
router.post('/login', vaildator, service.login);

// 用户注册路由
router.post('/register', regisrerVaildator, service.register);

router.post('/sendEmail', emailVaildator, service.email);

router.post('/info', phoneVaildator, service.info )
// router.post('/forget', forgetPwdVaildator, service.forgetPwd)
router.post('/stuInfo', service.stuInfo);
router.post('/teaInfo', service.teaInfo);
router.post('/addTea', service.addTea);
router.post('/deleteStu', service.deleteStu);
router.post('/deleteTea', service.deleteTea);

// 密码重置路由
router.post('/resetPwd', forgetPwdVaildator, service.resetPwd);


module.exports = router;

