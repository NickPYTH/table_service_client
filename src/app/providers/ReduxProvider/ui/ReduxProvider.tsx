import {FC} from "react";
import {Provider} from "react-redux";
import {setupStore} from "store/store";

const store = setupStore();

const ReduxProvider: FC = ({children}) => {
    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}

export default ReduxProvider;