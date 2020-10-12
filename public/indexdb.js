/*
 打开/创建一个IndexedDB数据库
 (当该数据库不存在时，open 方法会直接创建一个名为 xiaoceDB 新数据库)
*/
// 后面的回调中，我们可以通过event.target.result拿到数据库实例
let db
// 参数1为数据库名，参数2为版本号
const request = window.indexedDB.open('xiaoceDB', 1);
// 使用IndexedDB失败时的监听函数
request.onerror = function(event) {
	console.log('无法使用IndexedDB');
}
// 成功
request.onsuccess = function(event) {
	// 此处可以获取到db实例
	db = event.target.result;
	console.log('你打开了IndexedDB');
}

/*
 创建一个object store
 (object store 对标到数据库中的“表”单位)
*/
// onupgradeneeded事件会在初始化数据库/版本发生更新时被调用，我们在它的监听函数中创建object store
request.onupgradeneeded = function(event) {
	let objectStore
	db = event.target.result;
	// 如果同名表未被创建过，则新建test表
	if(db && !db.objectStoreNames.contains('test')) {
		objectStore = db.createObjectStore('test', { keyPath: 'id' });
	}
	setTimeout(doSomething, 3000);
}

function doSomething() {
	/*
	 构建一个事务来执行一些数据库操作，像增加或提取数据等。
	*/
	// 创建事务，指定表名和读写权限
	const transaction = db.transaction(["test"], "readwrite");
	// 拿到Object Store对象
	const objectStore = transaction.objectStore("test");
	// 向表写入数据
	objectStore.add({ id: 1, name: 'yy' });

	/*
	 通过监听正确类型的事件以等待操作完成
	*/
	// 操作成功时的监听函数
	transaction.oncomplete = function(event) {
		console.log('操作成功');
	}
	// 操作失败时的监听函数
	transaction.onerror = function(event) {
		console.log('这里有一个Error')
	}
}