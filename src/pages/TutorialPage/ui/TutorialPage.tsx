import {DataNode} from 'antd/es/tree';
import React, {Key, useState} from 'react';
import {Flex, Image, Tree, Typography} from "antd";
//@ts-ignore
import Chapter1CreateTable from "shared/assets/Chapter1CreateTable.png";
//@ts-ignore
import Chapter2ImportTable from "shared/assets/Chapter2ImportTable.png";
//@ts-ignore
import Chapter3WorkZone from "shared/assets/Chapter3WorkZone.png";
//@ts-ignore
import Chapter4TableSettings from "shared/assets/Chapter4TableSettings.png";
//@ts-ignore
import Chapter5ColumnSettings from "shared/assets/Chapter5ColumnSettings.png";
//@ts-ignore
import Chapter5ColumnTypes from "shared/assets/Chapter5ColumnTypes.png";
//@ts-ignore
import Chapter6RowSettings from "shared/assets/Chapter6RowSettings.png";
//@ts-ignore
import Chapter7Formula1 from "shared/assets/Chapter7Formula1.png";
//@ts-ignore
import Chapter7Formula2 from "shared/assets/Chapter7Formula2.png";
//@ts-ignore
import Chapter7Formula3 from "shared/assets/Chapter7Formula3.png";
//@ts-ignore
import Chapter7Formula4 from "shared/assets/Chapter7Formula4.png";

const {Text, Title} = Typography;

const TutorialPage = () => {

    // States
    const [selected, setSelected] = useState<Key[]>(['0-0-0']);
    // -----

    // Handlers
    const goToTables = () => {
        let tmpButton = document.createElement('a');
        tmpButton.href = `https://${document.location.host}/table_service/tables_list`
        tmpButton.click();
    };
    // -----

    // Useful utils
    const treeData: DataNode[] = [
        {
            title: 'Оглавление',
            key: '0-0',
            children: [
                {
                    title: 'Создание таблицы', key: '0-0-0'
                },
                {
                    title: 'Импорт таблицы', key: '0-1-0'
                },
                {
                    title: 'Рабочая область таблицы', key: '0-2-0'
                },
                {
                    title: 'Настройки таблицы', key: '0-3-0'
                },
                {
                    title: 'Настройки столбцов', key: '0-4-0'
                },
                {
                    title: 'Настройки строк', key: '0-5-0'
                },
                {
                    title: 'Формулы', key: '0-6-0'
                },
            ]
        }
    ];
    // -----

    return (
        <div style={{height: window.innerHeight - 140, paddingTop: '10px'}}>
            <div style={{display: 'flex', justifyContent: 'start'}}>
                <div style={{width: 400}}>
                    <Tree
                        treeData={treeData}
                        defaultExpandAll={true}
                        showIcon={true}
                        showLine={true}
                        onSelect={(e) => {
                            if (e[0] != '0-0-4' && e.length > 0) {
                                setSelected(e)
                            }
                        }}
                    />
                </div>
                <div style={{
                    width: window.innerWidth - 450,
                    fontSize: 16,
                    marginTop: 15,
                    marginBottom: 15,
                    padding: 15,
                    borderRadius: 10,
                    boxShadow: '4px 4px 15px #f0f0f0'
                }}>
                    {(selected[0] === '0-0-0' || selected[0] === '0-0') && <div>
                        <Title>Создание новой таблицы</Title>
                        <p>Для создания таблицы в главном меню нажмите на кнопку "Создать новую"</p>
                        <p>Выберите подходящее название и режим ввода данных (его можно будет поменять в настройках таблицы). Режим с подтверждением будет заправшивать перед каждым сохранением ваше подтверждение.</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter1CreateTable}/>
                        </Flex>
                    </div>}
                    {(selected[0] === '0-1-0') && <div>
                        <Title>Импорт таблицы</Title>
                        <p>Для импорта таблицы в главном меню нажмите на кнопку "Импорт таблицы"</p>
                        <p>Выберите подходящее название и файл с данными. Учтите, что файл должен быть без объедененных ячеек и содержать шапку высотой в 1 строку.</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter2ImportTable}/>
                        </Flex>
                    </div>}
                    {(selected[0] === '0-2-0') && <div>
                        <Title>Рабочая область таблицы</Title>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter3WorkZone}/>
                        </Flex>
                        <p>1 - Сменить название таблицы (доступно только владельцу таблицы)</p>
                        <p>2 - Настройки таблицы (доступно только владельцу таблицы)</p>
                        <p>3 - Обсуждение таблицы</p>
                        <p>4 - Вставка столбца</p>
                        <p>5 - Вставка строки в конец</p>
                        <p>6 - Экспорт таблицы</p>
                        <p>7 - Загрузка новых строк из файла в конец таблицы</p>
                        <p>8 - Быстрый посик по таблице</p>
                        <p>9 - Состояние соединения с сервером</p>
                        <p>10 - Удалить таблицу (доступно только владельцу таблицы)</p>
                        <p>11 - Завершить редактирование, т.е. снятие всех блокировок (доступно только владельцу таблицы)</p>
                        <p>12 - Контекстное меню быстрых команд</p>
                        <p>13 - Ячейка с формулой</p>
                        <p>14 - Настройки строки</p>
                        <p>15 - Выбор страницы</p>
                        <p>16 - Выбор количества записей на странице (Осторожно! Желательно не выбирать более 5к записей за раз)</p>
                        <p>17 - Текущий работник системы</p>
                    </div>}
                    {(selected[0] === '0-3-0') && <div>
                        <Title>Настройки таблицы</Title>
                        <p>Настройка режима подтверждения ввода в ячейку позволяет спрашивать пользователей перед сохранением данных.</p>
                        <p>Права доступа к таблице настраиваются на просмотр или на редактрование.</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter4TableSettings}/>
                        </Flex>
                    </div>}
                    {(selected[0] === '0-4-0') && <div>
                        <Title>Настройки столбцов</Title>
                        <p>Для открытия настройки столбцов необходимо навестись на край столбца и нажать на троеточие, далее в выпадающем списке выбрать "Настройки"</p>
                        <p>Права на столбец преобладают над правами на таблицу, поэтмоу вы можете более гибко настраивать выдачу прав.</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter5ColumnSettings}/>
                        </Flex>
                        <p>В выпадающем списке можно выбрать тип колонки, всего их 6:</p>
                        <p>1 - Тип текст, для ввода строкового типа данных, также позволяет использовать формулы</p>
                        <p>2 - Целое число</p>
                        <p>3 - Дробное число</p>
                        <p>4 - Тип дата в формате "DD.MM.YYYY"</p>
                        <p>5 - Тип дата и время в формате "DD.MM.YYYY HH:mm"</p>
                        <p>6 - Списочный тип позволяет контролировать ввод данных из определенного перечня</p>
                        <p>7 - Автоикремент неоходим когда нужно вести автоматичскую нумерацию строк</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter5ColumnTypes}/>
                        </Flex>
                    </div>}
                    {(selected[0] === '0-5-0') && <div>
                        <Title>Настройки строк</Title>
                        <p>Для открытия настройки строк необходимо нажать на шестеренку в крайнем столбце.</p>
                        <p>Права на строку преобладают над правами на таблицу, поэтмоу вы можете более гибко настраивать выдачу прав.</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter6RowSettings}/>
                        </Flex>
                    </div>}
                    {(selected[0] === '0-6-0') && <div>
                        <Title>Формулы</Title>
                        <p>Базовые арифметические операции между ячейками</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter7Formula1}/>
                        </Flex>
                        <p>Суммирование функцией СУММ</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter7Formula2}/>
                        </Flex>
                        <p>Базовые арифметические операции между ячейками и числами</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter7Formula3}/>
                        </Flex>
                        <p>Условная функция с примером сравнения двух дат</p>
                        <Flex style={{width: '100%'}} justify={'center'}>
                            <Image src={Chapter7Formula4}/>
                        </Flex>
                    </div>}
                </div>
            </div>
        </div>
    )
}

export default TutorialPage;