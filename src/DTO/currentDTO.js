export const currentDTO = async (user) => {

    user.first_name = user.first_name.toLowerCase()

    return user
}
