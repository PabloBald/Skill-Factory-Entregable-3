class ResponseObject{

    constructor(message,ok,status,data){
        this.message = message
        this.ok = ok
        this.status = status
        this.data = data
    }
}


module.exports = ResponseObject;