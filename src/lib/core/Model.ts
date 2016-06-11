// The **Model** class provides an easy-to-use API for generating and maintaining database models using Knex and Objection.js.
//
// ```typescript
// import { Model } from 'overland/core';
// import { StringField, BooleanField } from 'overland/db';
//
// class MyModel extends Model {
//   public static foobar = new StringField();
//   public static isAwesome = new BooleanField();
// }
// ```
// It's really just an Objection.js model under the hood, but provides a nice, sugary API for 
// defining relations, properties and generating migrations.
// ***

// First, we'll need to import Objection's Model class for extension. This will provide all the 
// nice query methods and the basic Modelish functionality. All we're doing here is generating 
// all the necessary static properties that would otherwise need to be manually set.

import { Model as ObjectionModel } from 'objection';
import { IModelSchema, IModelConstructor } from '../interfaces';
// Second, we'll need to import a `BigIncrementsField` to provide a default `id` for the Model.
import Field from '../db/Field';
import RelationField from '../db/RelationField';
import { BigIncrementsField } from '../../db';

export default class Model extends ObjectionModel {

  // We have a couple priorities here: first, we want to allow the user to manually set the
  // `tableName` manually as a static property as usual, but we also want **Overland** to be 
  // able to automatically generate a `tableName` from the name of the constructor.
  //
  // As a result, we have a private static property and some static getters/setters to return
  // that or the name of the class constructor function.

  public static app: string;

  /**
   * A manually-set `_tableName` property to be returned (if set) by the static `tableName()`
   * accessor.
   */
  private static _tableName: string;

  /**
   * Returns either the manually-set `tableName` static property or the name of the Model, as
   * determined by the function's name.
   */
  static get tableName() {
    return this._tableName || this.app + '_' + this.name;
  }

  /**
   * Sets the private `_tableName` property.
   */
  static set tableName(name: string) {
    this._tableName = name;
  }

  static get titleField(): string {
    const titleField = this.fields.find(item => item.field.isTitleField);
    const nameField = this.fields.find(item => new RegExp(this.name, 'i').test(item.name));
    return titleField ? titleField.name : nameField ? nameField.name : this.primaryKey;
  }

  // We'd like to automatically generate the tedious relation mappings for Objection to use,
  // but we also don't want to regenerate them every time they're requested. So we cache the
  // `relationMappings` and only go through the rigamarole of generating them if they haven't 
  // been made already.  

  /**
   * Private, cached relation mappings for Objection.
   */
  private static _relationMappings: any = null;

  static get relationMappings() {
    if (!this._relationMappings) {
      this._relationMappings = {};
      const props = this.staticProps;
      props.filter(prop => {
          const field = <RelationField>prop.field;
          return field.relation && prop.name !== 'model';
        })
        .forEach(prop => {
          const field = <RelationField>prop.field;
          this._relationMappings[prop.name] = field.defineRelationItem(this);
        });
    }
    return this._relationMappings;
  }

  // Furthermore, we want an easy way to access the primary key field of the table. In this
  // case, it's a matter of filtering out all the fields that have options (i.e., 
  // could not be a primary key), and finding the field where `primaryKey === true`.

  /**
   * Returns the name of the model's key, or the default ('id') if none is
   * found.
   */
  static get primaryKey() {
    const result = this.staticProps
      .filter(item => item.field.opts)
      .find(item => item.field.opts.primaryKey === true);
    return result ? result.name : 'id';
  }

  /**
   * Generates a JSON migration schema (basically a JSON representation of the field types)
   * for the model to be consumed by the migration class.
   */
  public static toJSON(): IModelSchema {

    const props = this.staticProps;
    const out: IModelSchema = {
      app: this.app,
      fields: [],
      name: this.name,
      tableName: this.tableName,
    };

    let hasPrimary = false;

    props.forEach(prop => {
      const json = prop.field.toJSON(this);
      json.name = prop.name;
      if (json.opts && json.opts.primaryKey) {
        if (hasPrimary) {
          throw new Error('Cannot have more than one primary key.');
        } else {
          hasPrimary = true;
        }
      }
      out.fields.push(json);
    });

    if (!hasPrimary) {
      const idField = new BigIncrementsField({ primaryKey: true });
      const id = idField.toJSON(this);
      id.name = 'id';
      out.fields.unshift(id);
    }

    if (out.app === undefined) {
      throw new Error(`Model ${this.name} has no associated application.`);
    }

    return out;
  }

  // Provides a filtered list of properties on the class constructor. These are unavailable as
  // field names for classes made via this API, but *can* be created using the lower-level Knex 
  // migration API and Objection.

  static get staticProps(): { name: string, field: Field }[] {
    const reserved = [
      'app',
      'length',
      'name',
      'arguments',
      'caller',
      'prototype',
      'relationMappings',
      'tableName',
      '_tableName',
      'titleField'
    ];
    return Object.keys(this)
      .filter(p => reserved.indexOf(p) === -1)
      .map(name => ({ name, field: this[name] }));
  }

  static get fields(): { name: string, field: Field }[] {
    return this.staticProps.filter(f => f.field instanceof Field);
  }

  // Eventually this method will perform necessary validations, but for now it'll just insert 
  // the values corresponding to the Ctor's static, non-reserved properties and set the values 
  // in the result object (including ones that the user may not have set, such as the id, to
  // their corresponding properties on the model instance.
  // 
  // ```typescript
  // async function() {
  //   
  //   const instance = new MyModel({
  //     foobar: 'Yeah!',
  //     isAwesome: true
  //   });
  //
  //   await instance.save();
  //   console.log(instance.id !== undefined) // true
  // }
  // ```

  /**
   * @todo - validate data
   */
  public async save(): Promise<this> {

    let res;
    const data = {};
    const relations = [];
    const Ctor = <IModelConstructor>this.constructor;

    if (!Ctor.knex()) {
      throw new Error('No database connection has been established for this model.');
    }

    const id = this[Ctor.primaryKey];

    Ctor.fields.forEach(prop => {
      if (this[prop.name] || this[prop.name] === false) {
        const field = <RelationField>prop.field;
        if (field.relation && this[prop.name]) {
          relations.push({ relation: prop.name, value: this[prop.name] });
        } else {
          data[prop.name] = this[prop.name];
        }
      }
    });

    if (id || id === 0) {
      res = await Ctor.query().updateAndFetchById(id, data);
    } else {
      res = await Ctor.query().insert(data);
    }

    if (relations.length) {
      await Promise.all(relations.map(async function handler({ relation, value }) {
        await res.$relatedQuery(relation).unrelate();
        if (Array.isArray(value)) {
          const promises = value.map(v => res.$relatedQuery(relation).relate(v));
          return Promise.all(promises);
        } else {
          return res.$relatedQuery(relation).relate(value);
        }
      }));
    }

    Object.keys(res || {})
      .filter(key => res[key] !== this[key])
      .forEach(key => this[key] = res[key]);

    return this;
  }

  constructor(opts?: any) {
    super();
    Object.keys(opts || {}).forEach(key => this[key] = opts[key]);
  }
}
