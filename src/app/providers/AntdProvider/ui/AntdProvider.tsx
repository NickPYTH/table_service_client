import ruRU from "antd/locale/ru_RU";
import {FC} from "react";
import {ConfigProvider} from "antd";
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from "dayjs/plugin/updateLocale";
import 'dayjs/locale/ru';

dayjs.extend(weekday);
dayjs.extend(updateLocale);

dayjs.updateLocale('ru', {
    weekStart: 1
});

const AntdProvider: FC = ({children}) => {
    return (
        <ConfigProvider
            locale={ruRU}
            theme={{
                components: {
                    Table: {
                        cellPaddingInline: 0,
                        cellPaddingBlock: 0
                    }
                }
            }}
        >
            {children}
        </ConfigProvider>
    )
}

export default AntdProvider;