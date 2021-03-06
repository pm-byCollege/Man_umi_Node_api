/**
 * 描述: 业务逻辑处理 - 任务相关接口
 * 作者: Jack Chen
 * 日期: 2020-06-20
*/

const { querySql, queryOne } = require('../utils/index');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const fs = require('fs')
const { validationResult } = require('express-validator');
const { 
  CODE_ERROR,
  CODE_SUCCESS, 
  PRIVATE_KEY, 
  JWT_EXPIRED 
} = require('../utils/constant');
const { decode } = require('../utils/user-jwt');
// const multer = require('multer');
const formidable = require('formidable');
const path = require('path');

// 查询任务列表
// function queryTaskList(req, res, next) {
//   const err = validationResult(req);
//   // 如果验证错误，empty不为空
//   if (!err.isEmpty()) {
//     // 获取错误信息
//     const [{ msg }] = err.errors;
//     // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
//     next(boom.badRequest(msg));
//   } else {
//     let { pageSize, pageNo, status } = req.query;
//     // 默认值
//     pageSize = pageSize ? pageSize : 1;
//     pageNo = pageNo ? pageNo : 1;
//     status = (status || status == 0) ? status : null;

//     let query = `select d.id, d.title, d.content, d.status, d.is_major, d.gmt_create, d.gmt_expire from sys_task d`;
//     querySql(query)
//     .then(data => {
//     	// console.log('任务列表查询===', data);
//       if (!data || data.length === 0) {
//         res.json({ 
//         	code: CODE_ERROR, 
//         	msg: '暂无数据', 
//         	data: [] 
//         })
//       } else {

//         // 计算数据总条数
//         let total = data.length; 
//         // 分页条件 (跳过多少条)
//         let n = (pageNo - 1) * pageSize;
//         // 拼接分页的sql语句命令
//         if (status) {
//           let query_1 = `select d.id, d.title, d.content, d.status, d.is_major, d.gmt_create, d.gmt_expire from sys_task d where status='${status}' order by d.gmt_create desc`;
//           querySql(query_1)
//           .then(result_1 => {
//             console.log('分页1===', result_1);
//             if (!result_1 || result_1.length === 0) {
//               res.json({ 
//                 code: CODE_SUCCESS, 
//                 msg: '暂无数据', 
//                 data: null 
//               })
//             } else {
//               let query_2 = query_1 + ` limit ${n} , ${pageSize}`;
//               querySql(query_2)
//               .then(result_2 => {
//                 console.log('分页2===', result_2);
//                 if (!result_2 || result_2.length === 0) {
//                   res.json({ 
//                     code: CODE_SUCCESS, 
//                     msg: '暂无数据', 
//                     data: null 
//                   })
//                 } else {
//                   res.json({ 
//                     code: CODE_SUCCESS, 
//                     msg: '查询数据成功', 
//                     data: {
//                       rows: result_2,
//                       total: result_1.length,
//                       pageNo: parseInt(pageNo),
//                       pageSize: parseInt(pageSize),
//                     } 
//                   })
//                 }
//               })
//             }
//           })
//         } else {
//           let query_3 = query + ` order by d.gmt_create desc limit ${n} , ${pageSize}`;
//           querySql(query_3)
//           .then(result_3 => {
//             console.log('分页2===', result_3);
//             if (!result_3 || result_3.length === 0) {
//               res.json({ 
//                 code: CODE_SUCCESS, 
//                 msg: '暂无数据', 
//                 data: null 
//               })
//             } else {
//               res.json({ 
//                 code: CODE_SUCCESS, 
//                 msg: '查询数据成功', 
//                 data: {
//                   rows: result_3,
//                   total: total,
//                   pageNo: parseInt(pageNo),
//                   pageSize: parseInt(pageSize),
//                 } 
//               })
//             }
//           })
//         }
//       }
//     })
//   }
// }

function queryDeliveryList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { stu_id } = req.body;
    console.log(stu_id);
    let query = `select * from delivery_info where stu_id='${stu_id}'`
    querySql(query)
    .then(data => {
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '暂无数据', 
        	data: null 
        })
      } else {
        let query1 = `select * from firm_info`
        let firmName = []
        querySql(query1)
        .then(data1 => {
          data.forEach((item) => {
            const tem = data1.find((a) => {
              return a.id === item.firmId
            })
            firmName.push(tem.name)
          })
          const result = data.map((b,index) => {
            return {
              name: firmName[index],
              postName: b.post
            }
          })
          console.log(result, 222);
          res.json({ 
            code: CODE_SUCCESS, 
            msg: '查询数据成功', 
            data: result
          })
        })
      }
    })
  }
}

// 查询单位列表
function queryFirmList(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { pageSize, page, name, region, classify } = req.body;
    let query = `select * from firm_info`;
    querySql(query)
    .then(data => {
    	// console.log('所有单位===', data);
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
        let n = pageSize;
        // 拼接分页的sql语句命令
        if (region || name || classify) {
            let query_4;
            let arr = [];
            if(region) arr[arr.length] = `region='${region}'`         
            if(name) arr[arr.length] = `name like '%${name}%'`          
            if(classify) arr[arr.length] = `classify='${classify}'`          
            if(arr.length>1) query_4=arr.join(' and ')
            else query_4 = arr[0]
          let query_1 = `select * from firm_info where ${query_4}`;
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
          let query_3 = query + ` limit ${pageS}, ${n}`;
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
                pageSize: n,
              })
            }
          })
        }
      }
    })
  }
}

// 查询企业详情
function getFirmInfo(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { id } = req.body;
    let query = `select * from firm_info where id=${id}`;
    querySql(query)
    .then(data => {
    	console.log('详情===', data);
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '暂无数据', 
        	data: null 
        })
      } else {
        res.json({ 
          code: CODE_SUCCESS, 
          msg: '查询数据成功', 
          data
        })    
      }
    })
  }
}

// 查询投递情况
function getDeliveryInfo(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    // 获取错误信息
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回 
    next(boom.badRequest(msg));
  } else {
    let { firmId } = req.body;
    let query = `select * from delivery_info where firmId=${firmId}`;
    querySql(query)
    .then(data => {
    	console.log('===', data);
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '暂无数据', 
        	data: []
        })
      } else {
        
        res.json({ 
          code: CODE_SUCCESS, 
          msg: '查询数据成功', 
          data,
          path: JSON.stringify(data.filepath)
        })    
      }
    })
  }
}

function findFirm(param) {
    let query = null;
      query = `select * from firm_info where name='${param}'`;

      
    return queryOne(query);
}

// 添加企业
function addFirm(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { name, classify, endTime, post, region } = req.body;
    console.log(post);
    let posts = post.map((item) => {
      return item.postName
    }).join(',')
    let postIds = post.map((item) => {
      return item.id
    }).join(',')
    findFirm(name)
    .then(task => {
      if (task) {
        res.json({ 
          code: CODE_ERROR, 
          msg: '企业名称不能重复', 
          data: null
        })
      } else {
        const query = `insert into firm_info(name, classify, endTime, post, region, postId) values('${name}', '${classify}', '${endTime}', '${posts}', '${region}', '${postIds}')`;
        querySql(query)
        .then(data => {
          // console.log('添加任务===', data);
          if (!data || data.length === 0) {
            res.json({ 
              code: CODE_ERROR, 
              msg: '添加企业失败', 
              data: null 
            })
          } else {
            res.json({ 
              code: CODE_SUCCESS, 
              msg: '添加数据成功', 
              data: null 
            })
          }
        })
      }
    })

  }
}

// 删除企业
function deleteFirm(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, type } = req.body;
        if (type === 3) {
          res.json({ 
            code: CODE_ERROR, 
            msg: '删除数据失败，目前无权限', 
            data: null 
          })
        } else {
          const query = `delete from firm_info where id='${id}'`;
          querySql(query)
          .then(data => {
            if (!data || data.length === 0) {
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
  }
}

// 修改企业
function editFirm(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { id, name, region, endTime, classify, post, type } = req.body;
    if (type === 3) {
      res.json({ 
        code: CODE_ERROR, 
        msg: '删除数据失败，目前无权限', 
        data: null 
      })
    } else {
      let posts = post.map((item) => {
        return item.postName
      }).join(',')
      let postIds = post.map((item) => {
        return item.id
      }).join(',')
         findFirm(name)
          .then(result => {
            if (result && result.id !== id) {
              res.json({ 
                code: CODE_ERROR, 
                msg: '企业名称不能重复', 
                data: null 
              })
            } else {
              const query = `update firm_info set name='${name}', region='${region}', classify='${classify}', post='${posts}', postId='${postIds}', endTime='${endTime}' where id='${id}'`;
              querySql(query)
              .then(data => {
                if (!data || data.length === 0) {
                  res.json({ 
                    code: CODE_ERROR, 
                    msg: '更新企业失败', 
                    data: null 
                  })
                } else {
                  res.json({ 
                    code: CODE_SUCCESS, 
                    msg: '更新企业成功', 
                    data: null 
                  })
                }
              })
            }
          })
    }
  }
}

function queryPostList(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let {  postName } = req.body;
    let query = `select * from postList`;
    querySql(query)
    .then((data) => {
      console.log('所有岗位', data);
      let total = data.length
      if (!data || data.length === 0) {
        res.json({ 
        	code: CODE_ERROR, 
        	msg: '暂无数据', 
        	data: [] 
        })
      } else {
        if (postName){
          let query_1 = query + ` where postName like '%${postName}%'`
          querySql(query_1)
          .then((data1) => {
            if (!data1 || data1.length === 0) {
              res.json({ 
                code: CODE_ERROR, 
                msg: '暂无数据', 
                data: [] 
              })
            } else {
              res.json({ 
                code: 200, 
                msg: '查询成功', 
                data: data1,
                total: total
              })
            }
          })
        } else {
          res.json({ 
            code: 200, 
            msg: '查询成功', 
            data: data,
            total: total,
          })
        }
      }
    })
  }
}

// 添加简历
function upload(req, res, next) {
    const form = new formidable.IncomingForm();
    const { stu_id, firmId, postId } = req.query
    form.uploadDir = path.join(__dirname, '../upload');
    form.parse(req, function(err, fileds, files){
      if(err) next(err);
      console.log(files);
      const url = files.file.newFilename
      findDelivery({
        stu_id,
        firmId,
        postId
      }).then(task => {
        if (task) {
          // 以投递过
          const query = `update delivery_info set filepath='${url}' where stu_id='${Number(stu_id)}' and postId='${postId}' and firmId='${firmId}'`;
          querySql(query)
          .then(data => {
            if (!data || data.length === 0) {
              res.json({ 
                code: CODE_ERROR, 
                msg: '添加数据失败', 
                data: null 
              })
            } else {
              res.send({
                status: 200,
                data: null,
                msg: '上传成功'
              })
            }
          })
        } else {
          const query1 = `select student_name from student_info where student_id='${stu_id}'`
          querySql(query1)
          .then(res1 => {
            console.log(res1);
            const query2 = `select postName from postlist where id='${postId}'`
            querySql(query2)
            .then(res2 => {
              console.log(res2);
              const query3 = `insert into delivery_info(stu_id, firmId, stu_name, post ,filepath, postId) values('${stu_id}', '${firmId}', '${res1[0].student_name}', '${res2[0].postName}', '${url}', '${postId}' )`
              querySql(query3)
              .then(res3 => {
                if (!res3 || res3.length === 0) {
                  res.json({ 
                    code: CODE_ERROR, 
                    msg: '失败', 
                    data: null 
                  })
                } else {
                  res.json({ 
                    code: CODE_SUCCESS, 
                    msg: '成功', 
                    data: null 
                  })
                }
              })
            })
          })
        }
      })
      
    })
}

function findDelivery(param) {
  let query = null;
    query = `select * from delivery_info where stu_id='${param.stu_id}' and firmId='${param.firmId}' and postId='${param.postId}'`;
  return queryOne(query);
}


function down(req, res, next) {
  const { name } = req.query
  const url = path.join(__dirname, '../upload')
  const fileName = url + `\\${name}`
  res.sendFile(fileName)
}




module.exports = {
  queryFirmList,
  addFirm,
  editFirm,
  upload,
  down,
  queryDeliveryList,
  deleteFirm,
  getFirmInfo,
  getDeliveryInfo,
  queryPostList,
}
