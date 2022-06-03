import React from 'react';
import {
    Form,
    Input,

    Select,

    Button, InputNumber, message,

} from 'antd';
import axios from "axios";
import cookie from "react-cookies";
import {useNavigate} from "react-router-dom";


const {Option} = Select;

const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 8,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 16,
        },
    },
};
const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    },
};

const RegistrationForm = () =>
{
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const onFinish = (values) =>
    {
        console.log('Received values of form: ', values);
        axios.post('/svr/register', values).then((value) =>
        {
            console.log("response from server: " + value.data.status);
            let data = value.data

            if (data['status'] === 'success')
            {
                message.success('logging in successful');
                setTimeout(()=>
                {
                    navigate('/login');
                },2000);

            } else
            {
                message.error('log failed');
            }
        })
    };

    return (
        <div id={'register'}>
            <Form
                {...formItemLayout}
                form={form}
                name="register"
                onFinish={onFinish}
                initialValues={{

                }}
                scrollToFirstError
            >
                <h1 style={{marginLeft: "50%"}}>Register</h1>
                <Form.Item
                    name="username"
                    label="Username"
                    key={'username'}
                    rules={[

                        {
                            required: true,
                            message: 'Please input your Username!',
                        },
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    key={'password'}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        },
                    ]}
                    hasFeedback
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item
                    name="confirm"
                    label="Confirm Password"
                    key={'password'}
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        ({getFieldValue}) => ({
                            validator(_, value)
                            {
                                if (!value || getFieldValue('password') === value)
                                {
                                    return Promise.resolve();
                                }

                                return Promise.reject(new Error('The two passwords that you entered do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item
                    name="gender"
                    label="Gender"
                    key={'gender'}
                    rules={[
                        {
                            required: true,
                            message: 'Please select gender!',
                        },
                    ]}
                >
                    <Select placeholder="select your gender">
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                        <Option value="other">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item name={"age"} label="Age"
                           rules={[{type: 'number', min: 8, max: 80}, {required: true, message: "please select your age"}]}>
                    <InputNumber/>
                </Form.Item>


                <Form.Item
                    {...tailFormItemLayout}
                    key={'submit'}
                >
                    <Button type="primary" htmlType="submit">
                        Register
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default () => <RegistrationForm/>;