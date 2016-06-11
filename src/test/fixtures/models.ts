import { Model } from '../../core';
import * as Fields from '../../db';

export class One extends Model {
  public static app = 'myBlog';
  public static myBoolean = new Fields.BooleanField();
  public static myDate = new Fields.DateField();
  public static myDateTime = new Fields.DateTimeField();
}

export class Two extends Model {
  public static app = 'myBlog';
  public static myId = new Fields.BigIncrementsField();
  public static myInteger = new Fields.IntegerField();
  public static myFloat = new Fields.FloatField();
}

export class Three extends Model {
  public static app = 'myBlog';
  public static myText = new Fields.TextField();
  public static myString = new Fields.StringField();
}

export class Five extends Model {
  public static app = 'myBlog';
  public static myId = new Fields.BigIncrementsField();
  public static myIdTwo = new Fields.BigIncrementsField();
}

export class Four extends Model {
  public static app = 'myBlog';
  public static myHasMany = new Fields.HasManyField(Five);
  public static myBelongsToOne = new Fields.BelongsToOneField(One);
  public static myManyToMany = new Fields.ManyToManyField(Two);
  public static myOneToOne = new Fields.HasOneField(Three);
}


export class Post extends Model {
  public static app = 'myBlog';
  public static summary = new Fields.TextField();
  public static title = new Fields.StringField();
}