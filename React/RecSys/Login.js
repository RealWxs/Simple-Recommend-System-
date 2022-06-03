import React, {useState} from 'react'

import 'antd/dist/antd.css'
import cookie from 'react-cookies'


import axios from "axios";
import {Form, Input, Button, Checkbox, Row, message} from 'antd';
import {UserOutlined, LockOutlined} from '@ant-design/icons';
import {useNavigate} from "react-router-dom";

const Login = () =>
{

    const navigate = useNavigate();
    if ((typeof cookie.load('currentUser')) !== 'undefined')
    {
       /* return (
            <div>
                <h1>
                    welcome,{cookie.load('currentUser')}
                </h1>
                <Button onClick={()=>
                {
                    cookie.remove('currentUser');
                    message.success('logging out successful!');
                    setTimeout(()=>
                    {
                        navigate('/login');
                    },2000);
                }}>
                    Log out
                </Button>
            </div>*/
        navigate("/Explore");

    }

    const onFinish = (values) =>
    {
        console.log('Received values of form: ', values);
        axios.post('/svr/login', values).then((value) =>
        {
            console.log("response from server: " + value.data.status);
            let data = value.data

            if (data['status'] === 'success')
            {
                message.success('logging in successful');
                setTimeout(()=>
                {
                    navigate('/login');
                },2000)

            } else
            {
                message.error('log failed');
            }
        })
    };

    return (
        <div id={'login'}>
            <h1 align={'middle'}>Login</h1>
            <Form
                name="normal_login"
                className="login-form"
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Username!',
                        },
                    ]}
                >
                    <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Username"/>
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Password!',
                        },
                    ]}
                >
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon"/>}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>


                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Log in
                    </Button>
                    Or <a href="Register">register now!</a>
                </Form.Item>

            </Form>
        </div>

    );
};


export default Login;