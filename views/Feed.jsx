/**
 * Screen to display a feed of relevant posts in a scrollable list.
 * TODO: This should probably be re-used for All Feed and My Subs, receiving specificity through props
*/

import React from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView, Platform } from 'react-native';
import {
  Container, Header, Footer, Content, Card, CardItem, Thumbnail, Text, Button, Icon,
  Left, Label, Body, Right, Title, Form, Input, Item, Spinner
} from 'native-base';
import { Font, AppLoading } from "expo";

import _ from 'lodash';

import NavBar from '../components/Navbar';
import ContentBar from '../components/ContentBar';
import Post from '../components/Post';
import NoData from '../components/NoData';
import api from '../ApiClient';

export default class FeedView extends React.Component {

  static navigationOptions = ({ navigation }) => {
    var channel = navigation.getParam('channel')
    if (channel) title = channel.name;
    else title = 'Feed';

    return {
      title,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: true,
      channelId: 'Feed'
    }
  }

  async componentWillMount() {

    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });

    const {
      navigation,
    } = this.props;

    var channel = navigation.getParam('channel');
    if (!channel) channel = { _id: 'all' };

    var channelId = channel._id;

    // TODO: implement method of fetching posts for subscribed channels
    var uri;
    if (['all', 'subs'].includes(channelId)) uri = '/posts';
    else uri = `/channels/${channelId}/posts`;

    await api.get(uri)
      .then(response => {
        this.setState({ posts: response });
      })
      .catch((err) => {
        console.error(err);
      });

    this.setState({ loading: false, channel });
  }

  addPost = async(data) => {
    const { channel } = this.state;
    // api call to create post
  }

  updatePost = async (postId, data) => {
    await api.put(`/posts/${postId}`, {}, data)
      .then(() => {
        alert("Post updated");
      })
      .catch(err => {
        alert("Error updating post");
      });
  }

  onPressPost = (postId) => {
    //this.props.navigation.navigate('Post', { postId: postId });
    alert('Post pressed')
  }

  getFooterJSX() {
    const { channel } = this.state;

    if (!['all', 'subs'].includes(channel._id)) {
      return (
        <Footer>
          <ContentBar
            channel={channel}
            addResource={this.addPost}
          />
        </Footer>
      )
    }
    return null;
  }

  render() {
    const {
      posts,
      loading,
    } = this.state;

    if (loading) {
      return (
        <Container>
          <Content>
            <Spinner color='#cd8500' />
          </Content>
        </Container>
      );
    } else if (posts.length) {
      return (
        <Container>
          {/* <Header>
            <NavBar />
          </Header> */}
          <Content>
            <ScrollView>
              {
                _.map(_.sortBy(posts, post => post.createdAt.valueOf()),
                  (post, key) => {
                    return (
                      <Post
                        key={`post${key}`}
                        data={post}
                        onPressPost={this.onPressPost}
                        updatePost={this.updatePost}
                      />
                    )
                  })
              }
            </ScrollView>
          </Content>

          {this.getFooterJSX()}

        </Container>
      )
    } else {
      return <NoData resourceName={'posts'} addResource={this.addPost} />
    }
  }
}

FeedView.propTypes = {
  channelId: PropTypes.string // should be 'all', 'subs' or channel id
}