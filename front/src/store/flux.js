const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            //Your data structures, A.K.A Entities
            scrolled: false,
        },
        actions: {
            //(Arrow) Functions that update the Store
            // Remember to use the scope: scope.state.store & scope.setState()
           
        },
    };
};
export default getState;