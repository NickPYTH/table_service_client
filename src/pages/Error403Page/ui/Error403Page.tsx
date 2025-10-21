import {Button, Result} from "antd";

const Error403Page = () => {

    const tryAgain = () => {
        let tmpButton = document.createElement('a');
        tmpButton.href = `https://test-vapp-03.sgp.ru/table_service/tables_list`
        tmpButton.click();
    };

    return (
        <Result
            status={'403'}
            title={'403'}
            subTitle={'Извините, у вас нет доступа на просмотр этой страницы. Обратитесь в службу поддержки.'}
            extra={<Button type={'primary'} onClick={tryAgain}>Попробовать еще раз</Button>}
        />
    )
}

export default Error403Page;