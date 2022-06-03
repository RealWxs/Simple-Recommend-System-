import React, {Component, useMemo, useState} from 'react';
import {useParams, useSearchParams} from "react-router-dom";
import {
    Button,
    Card,
    Col,
    Divider,
    Input,
    Layout,
    List,
    message,
    PageHeader,
    Radio,
    Result,
    Row,
    Badge
} from "antd";
import {Content, Footer, Header} from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import {SearchOutlined, FileSearchOutlined} from '@ant-design/icons';
import axios from "axios";


function Search()
{
    const [param, setparam] = useSearchParams();
    const [inp_val, setInp] = useState('');

    const [list, setList] = useState([]);
    const [popular, setPopular] = useState(['p1', 'p2', 'p3']);
    const [rec, setRec] = useState(['r1', 'r2', 'r3']);


    return (
        <Layout>
            <Layout style={{marginTop: '15px'}}>
                <Header style={{backgroundColor: 'rgb(240,242,245)'}}>
                    <Row>

                        <Col offset={0} span={20}>
                            <Input size={"large"} placeholder={'Search for some films...'}
                                   value={inp_val}
                                   onChange={(e) =>
                                   {
                                       setInp(e.target.value);
                                   }}
                            />
                        </Col>
                        <Col span={3}>
                            <Button size={"large"} onClick={(e) =>
                            {

                                console.log(inp_val);
                                if (inp_val.length === 0)
                                {
                                    message.info('no query words');
                                    return
                                }
                                axios.post('/svr/search', {wd: inp_val}).then((value) =>
                                {
                                    let data = value.data
                                    setList(data.q_res);
                                    setRec(data.rec_res)
                                    setPopular(data.pop_res)
                                    // fixme
                                })

                                setInp('');
                            }}
                                    icon={<SearchOutlined/>}
                            >search</Button>
                        </Col>
                    </Row>

                </Header>
                {list.length === 0 ? <Result
                    icon={<FileSearchOutlined/>}
                    title="Input Words to Search..."
                /> : <Content>
                    <br/>
                    <Divider orientation="left">Results</Divider>
                    <List

                        bordered
                        dataSource={list}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<a href={'/Explore?id=' + item.myMovieId}>{item.title}</a>}
                                    description={item.genres}
                                />
                            </List.Item>
                        )}
                    />
                </Content>}

            </Layout>

            {list.length === 0 ? '' : <Sider style={{marginTop: '130px', backgroundColor: "rgb(240,242,245)",marginRight:'5px'}}>


                <Content >
                    <h1>See also</h1>

                    <List
                        dataSource={popular}
                        renderItem={item => (

                            // <List.Item>
                            //     <List.Item.Meta
                            //         title={<a href={'/Explore?id=' + item}>{item}</a>}
                            //         description={'test'}
                            //     />
                            // </List.Item>
                            <Badge.Ribbon text="Pop" color={"red"}>
                                <Card title={<a href={'/Explore?id=' + item[0]}>{item[1]}</a>} size="small">
                                    {item[2]}
                                </Card>
                            </Badge.Ribbon>
                        )}
                    />
                    <List
                        dataSource={rec}
                        renderItem={item => (

                            <Badge.Ribbon text="Rec">
                                <Card title={<a href={'/Explore?id=' + item[0]}>{item[1]}</a>} size="small">
                                    {item[2]}
                                </Card>
                            </Badge.Ribbon>
                        )}
                    />
                </Content>


            </Sider>}


        </Layout>
    )
}


export default Search;