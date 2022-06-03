import React, {useEffect, useState} from 'react'
import cookie from "react-cookies";
import {Button, Layout, List, Pagination, message, Result, Badge, Card} from "antd";
import {Content, Footer, Header} from "antd/es/layout/layout";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {LogoutOutlined,HeartOutlined} from '@ant-design/icons'

export default function User()
{
    const [fav, setFav] = useState([])
    const navigate = useNavigate()
    const [login, setLogin] = useState(false)
    const [query, setQuery] = useState('fav')
    useEffect(() =>
    {

        if (typeof cookie.load('currentUser') !== 'undefined')
        {
            setLogin(true);
            axios.post('/svr/fetchFavs', {
                username: cookie.load('currentUser'),
            }).then((value) =>
            {
                let data = value.data;
                setFav(data.info);
            })
        } else
        {
            message.info('jumping to login page')
            setTimeout(() =>
            {
                navigate('/Login');
            }, 2000)
        }

    }, [])


    return (
        // <Layout>
        //     <Header style={{backgroundColor:"rgb(240,242,245)"}}>
        //         <h1>Welcome,{cookie.load('currentUser')}</h1>
        //     </Header>
        //     <Content>
        //         <List
        //             itemLayout="horizontal"
        //             dataSource={fav}
        //             renderItem={item => (
        //                 <List.Item>
        //                     <List.Item.Meta
        //                         title={<a href={"/Explore?id="+item[0]}>{item[1]}</a>}
        //                     />
        //                 </List.Item>
        //             )}
        //         />
        //     </Content>
        //     <Footer>
        //         <Pagination defaultCurrent={2} total={total} onChange={(e)=>
        //         {
        //             axios.post("/svr/fetchFavs",{username:cookie.load('currentUser'),needCount:false,page:e}).then((value)=>
        //             {
        //                 let data = value.data;
        //                 setFav(data.info);
        //             })
        //         }}/>
        //     </Footer>
        // </Layout>
        <div>
            {login ? <Layout><Header style={{backgroundColor:'white'}}>welcome, {cookie.load('currentUser')} <Button onClick={() =>
            {
                axios.post('/svr/logout', {username: cookie.load('currentUser')}).then(() =>
                {
                    cookie.remove('currentUser');
                    message.success('logging out successful!');
                    setTimeout(() =>
                    {
                        navigate('/Explore');
                    }, 2000);
                })

            }}
                                                                                                                     icon={<LogoutOutlined />}
            >Log out</Button>
                <Button onClick={() =>
            {
                axios.post('/svr/fetchFavs', {
                    username: cookie.load('currentUser'),
                }).then((value) =>
                {
                    let data = value.data;
                    setFav(data);
                })
            }
            }
                        icon={<HeartOutlined />}
                >my favs</Button>
            </Header>
                <Content>
                    <List
                        dataSource={fav}
                        renderItem={item => (

                            <Badge.Ribbon text="Fav" color={'pink'}>
                                <Card title={<a href={'/Explore?id=' + item[0]}>{item[1]}</a>} size="small">
                                    {item[2]}
                                </Card>
                            </Badge.Ribbon>
                        )}
                    /></Content>

            </Layout> : <Result
                title="Your are not logged in yet"

            />}


        </div>
    )


}

