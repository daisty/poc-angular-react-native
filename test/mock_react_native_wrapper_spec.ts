import {
  inject, TestComponentBuilder,
  beforeEachProviders, beforeEach,
  iit, it, xit,
  describe, ddescribe, xdescribe
  expect
} from 'angular2/testing';
import {MockReactNativeWrapper} from './mock_react_native_wrapper'

describe('MockReactNativeWrapper', () => {

  it('should initialize', () => {
    var mock = new MockReactNativeWrapper();
    expect(mock.commandLogs).toEqual([]);
    expect(mock.root).toEqual(mock.nativeElementMap.get(1));
  });

  it('should create a view', () => {
    var mock = new MockReactNativeWrapper();
    var tag = mock.createView('RCTView', 1, {foo: 'bar'});
    expect(tag).toEqual(2);
    expect(mock.commandLogs.length).toEqual(1);
    expect(mock.commandLogs.toString()).toEqual('CREATE+2+RCTView+{"foo":"bar"}');
    var element = mock.nativeElementMap.get(2);
    expect(element.name).toEqual('RCTView');
    expect(element.tag).toEqual(2);
    expect(element.properties).toEqual({foo: 'bar'});
  });

  it('should update a view', () => {
    var mock = new MockReactNativeWrapper();
    mock.createView('RCTView', 1, {foo: 'bar'});
    mock.updateView(2, 'RCTText', {bar: 'foo'});
    expect(mock.commandLogs.length).toEqual(2);
    expect(mock.commandLogs.toString()).toEqual('CREATE+2+RCTView+{"foo":"bar"},UPDATE+2+RCTText+{"bar":"foo"}');
    var element = mock.nativeElementMap.get(2);
    expect(element.name).toEqual('RCTText');
    expect(element.tag).toEqual(2);
    expect(element.properties).toEqual({foo: 'bar', bar: 'foo'});
  });

  it('should attach a native element', () => {
    var mock = new MockReactNativeWrapper();
    mock.createView('RCTView', 1, {});
    mock.createView('RCTView', 1, {});
    mock.clearLogs();
    mock.manageChildren(1, null, null, [2,3], [0,1], null);
    expect(mock.commandLogs.length).toEqual(2);
    expect(mock.commandLogs.toString()).toEqual('ATTACH+1+2+0,ATTACH+1+3+1');
    var element1 = mock.nativeElementMap.get(2);
    var element2 = mock.nativeElementMap.get(3);
    expect(element1.parent).toEqual(mock.root);
    expect(element2.parent).toEqual(mock.root);
    expect(mock.root.children).toEqual([element1, element2]);
  });

  it('should delete a native element', () => {
    var mock = new MockReactNativeWrapper();
    mock.createView('RCTView', 1, {});
    mock.createView('RCTView', 1, {});
    mock.manageChildren(1, null, null, [2,3], [0,1], null);
    mock.clearLogs();
    mock.manageChildren(1, null, null, null, null, [0]);
    expect(mock.commandLogs.length).toEqual(1);
    expect(mock.commandLogs.toString()).toEqual('DETACH+1+0');
    var element1 = mock.nativeElementMap.get(2);
    var element2 = mock.nativeElementMap.get(3);
    expect(element1).toEqual(undefined);
    expect(element2.parent).toEqual(mock.root);
    expect(mock.root.children).toEqual([element2]);
  });

  it('should move a native element', () => {
    var mock = new MockReactNativeWrapper();
    mock.createView('RCTView', 1, {});
    mock.createView('RCTView', 1, {});
    mock.createView('RCTView', 1, {});
    mock.manageChildren(1, null, null, [2,3,4], [0,1,2], null);
    mock.clearLogs();
    mock.manageChildren(1, [1], [2], null, null, null);
    expect(mock.commandLogs.length).toEqual(2);
    expect(mock.commandLogs.toString()).toEqual('DETACH+1+1,ATTACH+1+3+2');
    var element = mock.nativeElementMap.get(3);
    expect(element.parent).toEqual(mock.root);
    expect(mock.root.children[2]).toEqual(element);
  });

  it('should manage children', () => {
    var mock = new MockReactNativeWrapper();
    mock.createView('RCTView', 1, {});
    mock.createView('RCTView', 1, {});
    mock.createView('RCTView', 1, {});
    mock.manageChildren(1, null, null, [2,3,4], [0,1,2], null);
    mock.createView('RCTView', 1, {});
    mock.createView('RCTView', 1, {});
    mock.clearLogs();
    mock.manageChildren(1, [0,1], [1,2], [5,6], [0,3], [2]);
    expect(mock.commandLogs.length).toEqual(7);
    expect(mock.commandLogs.toString()).toEqual('DETACH+1+2,DETACH+1+1,DETACH+1+0,ATTACH+1+5+0,ATTACH+1+2+1,ATTACH+1+3+2,ATTACH+1+6+3');
    expect(mock.nativeElementMap.get(1).children.map((a) => a.tag).join(',')).toEqual('5,2,3,6');
  });

  it('should dispatch command', () => {
    var mock = new MockReactNativeWrapper();
    mock.createView('RCTView', 1, {});
    mock.clearLogs();
    mock.dispatchCommand(2, 'foo');
    expect(mock.commandLogs.length).toEqual(1);
    expect(mock.commandLogs.toString()).toEqual('COMMAND+2+foo');
  });

});