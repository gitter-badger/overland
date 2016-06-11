import * as test from 'ava';
import { Controller } from '../../core';
import MyCtrl from '../fixtures/ctrl';

class BlogCtrl extends Controller {}

test('should intelligently generate controller property from constructor', t => {
  t.same(BlogCtrl.controller, 'blog');
});

test('it should allow for manual override of the controller property', t => {
  class MySecondBlogCtrl extends Controller {
    public static controller = 'myBlog';
  }
  t.same(MySecondBlogCtrl.controller, 'myBlog');
})