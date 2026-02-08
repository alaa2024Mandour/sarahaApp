export const create = async ({model,data} = {}) => {
    return await model.create(data)
}

export const findOne = async ({model,filter = { },options={}} = {})=> {
    const doc = model.findOne(filter)
    if(options.populate){
        doc.populate(options.populate)
    }
    return await doc.exec();
}

export const find = async ({model,filter = { },options={}} = {})=> {
    const doc = model.find(filter)
    //if you want to make skip , limit , populate , ... 
    if(options.populate){
        doc.populate(options.populate)
    }
    if(options.skip){
        doc.skip(options.skip)
    }
    if(options.limit){
        doc.limit(options.limit)
    }
    return await doc.exec();
}

export const udateOne = async ({model, filter = {} , update = { },options={}} = {})=> {
    const doc = model.udateOne(filter,update,{runValidator:true , ...options})
    return await doc.exec();
}

export const findOneAndUpdate = async ({model, filter = {} , update = { },options={}} = {})=> {
    const doc = model.udateOne(filter,update,{new:true,runValidator:true , ...options})
    return await doc.exec();
}