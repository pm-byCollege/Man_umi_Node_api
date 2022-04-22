/**
 * 描述: 业务逻辑处理 - 用户相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/


const { querySql, queryOne } = require('../utils/index');
const md5 = require('../utils/md5');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const { body, validationResult } = require('express-validator');
const { createSixNum } = require('../utils/createSixNum');

// const INITCODE = [];

const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('../utils/constant');
const { decode } = require('../utils/user-jwt');
const nodemailer = require('../utils/nodemailer');


// 登录
function login(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { username, password } = req.body;
    const query = `select * from user_info where username='${username}' and password='${password}'`;
    querySql(query)
    .then(user => {
    	console.log('用户登录===', user);
      if (!user || user.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '用户名或密码错误', 
        	data: null 
        })
      } else {
        // 登录成功，签发一个token并返回给前端
        const token = jwt.sign(
          // payload：签发的 token 里面要包含的一些数据。
          { username },
          // 私钥
          PRIVATE_KEY,
          // 设置过期时间
          { expiresIn: JWT_EXPIRED }
        )

        // let userData = {
        //   id: user[0].id,
        //   username: user[0].username,
        //   nickname: user[0].nickname,
        //   avator: user[0].avator,
        //   sex: user[0].sex,
        //   gmt_create: user[0].gmt_create,
        //   gmt_modify: user[0].gmt_modify
        // };

        res.json({ 
        	code: CODE_SUCCESS, 
        	msg: '200', 
        	data: { 
            token,
            phone: user[0].phone,
            type: user[0].type
            // userData
          } 
        })
      }
    })
  }
}

// 用户信息
function info(req, res, next) {

    const err = validationResult(req);
    // 如果验证错误，empty不为空
    if (!err.isEmpty()) {
      // 获取错误信息
      const [{ msg }] = err.errors;
      // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
      next(boom.badRequest(msg));
    } else {
      let { phone } = req.body;
      console.log(phone);
      const query = `select * from user_info where phone='${phone}'`;
      querySql(query)
      .then(user => {
        console.log('用户登录===', user);
        if (!user || user.length === 0) {
          res.json({ 
            code: CODE_ERROR, 
            msg: '无该用户', 
            data: null 
          })
        } else {
          // 登录成功
          console.log(user);
          let userData = {
            type: user[0].type,
            name: user[0].name,
            email: user[0].email,
            phone: user[0].phone,
            createTime: user[0].createTime,
            sex: user[0].sex ? '女' : '男',
          }
          res.json({ 
            code: CODE_SUCCESS, 
            msg: '200', 
            data: { 
              userData
            } 
          })
        }
      })
    }
}

// 注册
function register(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { username, password } = req.body;
    findUser(username)
  	.then(data => {
  		// console.log('用户注册===', data);
  		if (data) {
  			res.json({ 
	      	code: CODE_ERROR, 
	      	msg: '用户已存在', 
	      	data: null 
	      })
  		} else {
	    	password = md5(password);
  			const query = `insert into user_info(username, password) values('${username}', '${password}')`;
  			querySql(query)
		    .then(result => {
		    	// console.log('用户注册===', result);
		      if (!result || result.length === 0) {
		        res.json({ 
		        	code: CODE_ERROR, 
		        	msg: '注册失败', 
		        	data: null 
		        })
		      } else {
            const queryUser = `select * from sys_user where username='${username}' and password='${password}'`;
            querySql(queryUser)
            .then(user => {
              const token = jwt.sign(
                { username },
                PRIVATE_KEY,
                { expiresIn: JWT_EXPIRED }
              )

              let userData = {
                id: user[0].id,
                username: user[0].username,
                nickname: user[0].nickname,
                avator: user[0].avator,
                sex: user[0].sex,
                gmt_create: user[0].gmt_create,
                gmt_modify: user[0].gmt_modify
              };

              res.json({ 
                code: CODE_SUCCESS, 
                msg: '注册成功', 
                data: { 
                  token,
                  userData
                } 
              })
            })
		      }
		    })
  		}
  	})
   
  }
}

async function email(req, res, next) {
  const code = await createSixNum();
  time = new Date().getTime();
  const mail = {
    from: '<ming1911@163.com>',
    subject: '修改密码验证码',
    to: req.body.email,
    text: '验证码: ' + code
  };
  nodemailer(mail)
  // INITCODE[req.body.email] = code
  INITCODE = code
  res.send({
    code: 0,
    message: '发送成功'
  })
}


function resetPwd(req, res, next) {
  const err = validationResult(req);
  if(!err.isEmpty()){
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    const { email, code, password, password1 } = req.body;
    if(!password && password !== password1) 
      res.json({ 
        code: CODE_ERROR, 
        msg: '密码不一致，修改失败', 
        data: null 
      })

    // for (item in INITCODE) {
    //   console.log(1);
    //   if(item == email && INITCODE[item] == code){
    //     const query = `update user_info set password='${password}' where email='${email}'`
    //     querySql(query)
    //     .then(user => {
    //       if (!user || user.length === 0) {
    //         res.json({ 
    //           code: CODE_ERROR, 
    //           msg: '没有该邮箱', 
    //           data: null 
    //         })
    //       }
    //       else {
    //         res.json({ 
    //           code: CODE_SUCCESS, 
    //           msg: '重置密码成功', 
    //           data: null
    //         })
    //       }
    //     })
    //   }
    // }

    console.log(1);
    const resetTime = new Date().getTime()
    // if (resetTime - time >= 5 *1000 * 60) {
    //   res.json({
    //       code: -1,
    //       msg: '验证码已过期',
    //       data: null
    //   })
    // }
    const query = `update user_info set password='${password}' where email='${email}'`
    querySql(query)
    .then(user => {
      if (!user || user.length === 0) {
        res.json({ 
           code: CODE_ERROR, 
           msg: '没有该邮箱', 
          data: null 
        })
      }
       else {
        res.json({ 
          code: CODE_SUCCESS, 
           msg: '重置密码成功', 
          data: null
        })
       }
     })
    
  }
}

// 重置密码
// function resetPwd(req, res, next) {
// 	const err = validationResult(req);
//   if (!err.isEmpty()) {
//     const [{ msg }] = err.errors;
//     next(boom.badRequest(msg));
//   } else {
//     let { username, oldPassword, newPassword } = req.body;
//     oldPassword = md5(oldPassword);
//     validateUser(username, oldPassword)
//     .then(data => {
//       console.log('校验用户名和密码===', data);
//       if (data) {
//         if (newPassword) {
//           newPassword = md5(newPassword);
// 				  const query = `update sys_user set password='${newPassword}' where username='${username}'`;
// 				  querySql(query)
//           .then(user => {
//             // console.log('密码重置===', user);
//             if (!user || user.length === 0) {
//               res.json({ 
//                 code: CODE_ERROR, 
//                 msg: '重置密码失败', 
//                 data: null 
//               })
//             } else {
//               res.json({ 
//                 code: CODE_SUCCESS, 
//                 msg: '重置密码成功', 
//                 data: null
//               })
//             }
//           })
//         } else {
//           res.json({ 
//             code: CODE_ERROR, 
//             msg: '新密码不能为空', 
//             data: null 
//           })
//         }
//       } else {
//         res.json({ 
//           code: CODE_ERROR, 
//           msg: '用户名或旧密码错误', 
//           data: null 
//         })
//       }
//     })
   
//   }
// }

// 校验用户名和密码



function validateUser(username, oldPassword) {
	const query = `select id, username from sys_user where username='${username}' and password='${oldPassword}'`;
  	return queryOne(query);
}

// 通过用户名查询用户信息
function findUser(username) {
  const query = `select id, username from sys_user where username='${username}'`;
  return queryOne(query);
}

module.exports = {
  login,
  info,
  email,
  register,
  resetPwd
}
