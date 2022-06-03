import {Menu, Layout, Row, Col, Space, Divider} from "antd";
import React, {Component} from "react";
import {NavLink, Outlet} from "react-router-dom";
import cookie from "react-cookies";

const {Header, Content, Footer} = Layout;

class Main extends Component
{


    render()
    {

        return (

            <Layout className="layout">
                <Header>
                    <Menu
                        theme={'dark'}
                        mode={"horizontal"}
                    >
                        <Menu.Item key={'explore'}>
                            <NavLink to={''}>Explore</NavLink>
                        </Menu.Item>

                        <Menu.Item key={'search'}>
                            <NavLink to={"Search"}>Search</NavLink>
                        </Menu.Item>

                        <Menu.Item key={'user'}>
                            <NavLink to={'User'}>{'User'}</NavLink>
                        </Menu.Item>



                    </Menu>

                </Header>

                <Content >
                    <div className="site-layout-content"></div>
                    <Outlet/>
                </Content>
                <Footer style={{textAlign: 'center'}}>Simple RecSys for Recommend System Course Experiment</Footer>

            </Layout>
        );
    }


}

export default Main;