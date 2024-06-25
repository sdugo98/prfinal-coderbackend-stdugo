export const errorAcces =({first_name}) =>{
    return `
    Error acces:
    -Usted, ${first_name}, NO tiene los suficientes privilegios!.
    -Contacte al Administrador!
    `
}

export const errorDatos =() =>{
    return `
    Error en datos:
    -Controle sus datos!.
    -Ante cualquier consulta, Contacte al Administrador!
    `
}


export const errorInternal =() =>{
    return `
    -Error Inesperado, vuelva mas tarde!
    -Ante cualquier consulta, Contacte al Administrador!
    `
}

export const errorCastID =() =>{
    return `
    -EL ID ingresado es invalido!
    -Ante cualquier consulta, Contacte al Administrador!
    `
}