export class CustomError {
    static CustomError(name,message,statusCode,codeIn,description=""){
        let error= new Error(message)
        error.name = name
        error.code=statusCode
        error.codigoInterno = codeIn
        error.description=description

        return error
    }

}