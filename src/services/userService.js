import axios from "../axios";

const handleLoginAPI = (email, password) => {
    return axios.post('/api/login', { email, password })
}
const getAllUser = (id) => {
    //template string
    return axios.get(`/api/get-all-user?id=${id} `)
}
const CreateUser = (data) => {
    return axios.post('/api/create-new-user', data)
}
const DeleteUser = (UserId) => {
    // return axios.delete('/api/delete-user', { id });
    return axios.delete('/api/delete-user', {
        data: {
            id: UserId
        }
    });
}
const EditUser = (data) => {
    return axios.put('/api/edit-user', data)
}
const getAllCode = (type) => {
    return axios.get(`/api/allcodes?type=${type}`)

}
export { handleLoginAPI, getAllUser, CreateUser, DeleteUser, EditUser, getAllCode };