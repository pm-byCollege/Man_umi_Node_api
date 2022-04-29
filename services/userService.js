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
          let userData = {} ;
          if (user[0].type === 3){
            const query1 = `select student_id from student_info where username='${user[0].username}' `
            querySql(query1)
            .then(data => {
              userData = {
                stu_id: data[0].student_id,
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
            })
          } else {
            userData = {
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
        }
      })
    }
}

function stuInfo(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, page, student_id } = req.body;
    let query = `select * from student_info`;
    querySql(query)
    .then(data => {
    	console.log('所有学生===', data);
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '暂无数据', 
        	data: null 
        })
      } else {
        // 计算数据总条数
        let total = data.length; 
        // 分页条件 (跳过多少条)
        let pageS = (page - 1) * pageSize;
        let n =  pageSize;
        // 拼接分页的sql语句命令
        if (student_id) {
          let query_1 = `select * from student_info where student_id='${student_id}'`;
          querySql(query_1)
          .then(result_1 => {
            if (!result_1 || result_1.length === 0) {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '暂无数据', 
                data: [] 
              })
            } else {
              let query_2 = query_1 + ` limit ${pageS} , ${n}`;
              querySql(query_2)
              .then(result_2 => {
                if (!result_2 || result_2.length === 0) {
                  res.json({ 
                    code: CODE_SUCCESS, 
                    msg: '暂无数据', 
                    data: [] 
                  })
                } else {
                  res.json({ 
                    code: CODE_SUCCESS, 
                    msg: '查询数据成功', 
                    data:result_2,
                    total: result_1.length,
                    page: page,
                    pageSize: pageSize,
                  })
                }
              })
            }
          })
        } else {
          let query_3 = query + ` limit ${pageS} , ${n}`;
          querySql(query_3)
          .then(result_3 => {
            if (!result_3 || result_3.length === 0) {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '暂无数据', 
                data: [] 
              })
            } else {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '查询数据成功', 
                data: result_3,
                total: total,
                page: page,
                pageSize: pageSize,
              })
            }
          })
        }
      }
    })
  }
}

function deleteStu(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { student_id, phone, type } = req.body;
        if (type === 3) {
          res.json({ 
            code: CODE_ERROR, 
            msg: '删除数据失败，目前无权限', 
            data: null 
          })
        } else {
          const query = `delete from student_info where student_id='${student_id}'`;
          querySql(query)
          .then(data => {
            if (!data || data.length === 0) {
              res.json({ 
                code: CODE_ERROR, 
                msg: '删除数据失败', 
                data: null 
              })
            } else {
              const query2 = `delete from user_info where phone='${phone}'`;
              querySql(query2)
              .then(data1 => {
                if (!data1 || data1.length === 0) {
                  res.json({ 
                    code: CODE_ERROR, 
                    msg: '删除数据失败', 
                    data: null 
                  })
                } else {
                  res.json({ 
                    code: CODE_SUCCESS, 
                    msg: '删除数据成功', 
                    data: null 
                  })
                }
              })
            }
          })
        }
  }
}

function teaInfo(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, page, tea_id } = req.body;
    let query = `select * from teacher_info`;
    querySql(query)
    .then(data => {
    	console.log('所有老师===', data);
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '暂无数据', 
        	data: null 
        })
      } else {
        // 计算数据总条数
        let total = data.length; 
        // 分页条件 (跳过多少条)
        let pageS = (page - 1) * pageSize;
        let n =  pageSize;
        // 拼接分页的sql语句命令
        if (tea_id) {
          let query_1 = `select * from teacher_info where tea_id='${tea_id}'`;
          querySql(query_1)
          .then(result_1 => {
            if (!result_1 || result_1.length === 0) {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '暂无数据', 
                data: [] 
              })
            } else {
              let query_2 = query_1 + ` limit ${pageS} , ${n}`;
              querySql(query_2)
              .then(result_2 => {
                if (!result_2 || result_2.length === 0) {
                  res.json({ 
                    code: CODE_SUCCESS, 
                    msg: '暂无数据', 
                    data: [] 
                  })
                } else {
                  res.json({ 
                    code: CODE_SUCCESS, 
                    msg: '查询数据成功', 
                    data:result_2,
                    total: result_1.length,
                    page: page,
                    pageSize: pageSize,
                  })
                }
              })
            }
          })
        } else {
          let query_3 = query + ` limit ${pageS} , ${n}`;
          querySql(query_3)
          .then(result_3 => {
            if (!result_3 || result_3.length === 0) {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '暂无数据', 
                data: [] 
              })
            } else {
              res.json({ 
                code: CODE_SUCCESS, 
                msg: '查询数据成功', 
                data: result_3,
                total: total,
                page: page,
                pageSize: pageSize,
              })
            }
          })
        }
      }
    })
  }
}

function addTea(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { username, password, phone, tea_id, name, email } = req.body;
    tea_id = Number(tea_id)
    let type = 2
    findTea(username, phone)
  	.then(data => {
  		console.log('用户注册===', data);
  		if (data) {
        let errMsg = '';
        if (phone === data.phone) errMsg = '电话已存在'
        if (tea_id === data.tea_id) errMsg = '工号已存在'
        if (username === data.username) errMsg = '用户名已存在'
  			res.json({ 
	      	code: CODE_ERROR, 
	      	msg: errMsg,
	      	data: null 
	      })
  		} else {
	    	// password = md5(password);
  			const query = `insert into user_info(username, password, name, phone, email, type) values('${username}', '${password}', '${name}', '${phone}',  '${email}', '${type}')`;
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
            const query1 = `insert into teacher_info(name, username, phone, tea_id, email) values('${name}', '${username}', '${phone}', '${tea_id}', '${email}')`;
            querySql(query1)
            .then(result1 => {
              if (result1) {
                res.json({ 
                  code: CODE_SUCCESS, 
                  msg: '添加注册成功', 
                  data: null
                })
              }
            })
          }
		    })
  		}
    })
  }
}

function findTea(username, phone) {
  let query = null;
  query = `select * from user_info where username='${username}' or phone='${phone}'`;
  return queryOne(query);
}

// 注册
function register(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { username, password, phone, email, stu_id, name } = req.body;
    stu_id = Number(stu_id)
    let type = 3
    findUser(username, phone, email,)
  	.then(data => {
  		console.log('用户注册===', data);
  		if (data) {
        let errMsg = '';
        if (phone === data.phone) errMsg = '电话已存在'
        if (email === data.email) errMsg = '邮箱已存在'
        if (username === data.username) errMsg = '用户名已存在'
  			res.json({ 
	      	code: CODE_ERROR, 
	      	msg: errMsg,
	      	data: null 
	      })
  		} else {
	    	// password = md5(password);
  			const query = `insert into user_info(username, password, name, email, phone, type) values('${username}', '${password}', '${name}', '${email}', '${phone}', '${type}')`;
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
            const query1 = `insert into student_info(student_name, username, phone, student_id) values('${name}', '${username}', '${phone}', '${stu_id}')`;
            querySql(query1)
            .then(result1 => {
              if (result1) {
                res.json({ 
                  code: CODE_SUCCESS, 
                  msg: '注册成功', 
                  data: null
                })
              }
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
    if (resetTime - time >= 5 *1000 * 60) {
      res.json({
          code: -1,
          msg: '验证码已过期',
          data: null
      })
    }
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
function findUser(username, phone, email) {
  const query = `select phone, username, email from user_info where username='${username}' or phone='${phone}' or email='${email}'`;
  return queryOne(query);
}

module.exports = {
  login,
  stuInfo,
  teaInfo,
  addTea,
  deleteStu,
  info,
  email,
  register,
  resetPwd
}
