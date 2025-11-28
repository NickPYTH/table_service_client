import {Button, Flex, Result} from "antd";

const HelloPage = () => {

    const goToTables = () => {
        let tmpButton = document.createElement('a');
        tmpButton.href = `https://${document.location.host}/table_service/tables_list`
        tmpButton.click();
    };

    const goToTutorial = () => {
        let tmpButton = document.createElement('a');
        tmpButton.href = `https://${document.location.host}/table_service/tutorial`
        tmpButton.click();
    };

    return (
        <Result
            status={'404'}
            title={'Сервис электронных таблиц'}
            subTitle={'Если вы хотите перейти к свом таблицам нажмите "Перейти к таблицам", если вы хотите ознакомиться с техническими возможностями системы нажмите "Ознакомиться с инструкцией"'}
            extra={<Flex gap={'small'} justify={'center'}>
                <Button type={'primary'} onClick={goToTables}>Перейти к таблицам</Button>
                <Button type={'primary'} onClick={goToTutorial}>Ознакомиться с инструкцией</Button>
            </Flex>}
        />
    )
}

export default HelloPage;