class ApiError extends Error{
      constructor(
            statusCode,
            message="something went wrong",
            errStack="",
            errors=[]
      ){
          super(message);
          this.statusCode=statusCode;
          this.data=null;
          this.success=false;
          this.errors=errors;
          if(errStack){
            this.stack=errStack;
          }else{
            Error.captureStackTrace(this,this.constructor);
          }
      }
}

export {ApiError};