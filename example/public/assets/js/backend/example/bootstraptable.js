define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'template'], function ($, undefined, Backend, Table, Form, Template) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'example/bootstraptable/index',
                    add_url: '',
                    edit_url: '',
                    del_url: 'example/bootstraptable/del',
                    multi_url: '',
                }
            });

            var table = $("#table");

            //在普通搜索提交搜索前
            table.on('common-search.bs.table', function (event, table, query) {
                //这里可以获取到普通搜索表单中字段的查询条件
                console.log(query);
            });

            //在普通搜索渲染后
            table.on('post-common-search.bs.table', function (event, table) {
                var form = $("form", table.$commonsearch);
                $("input[name='title']", form).addClass("selectpage").data("source", "auth/adminlog/selectpage").data("primaryKey", "title").data("field", "title").data("orderBy", "id desc");
                $("input[name='username']", form).addClass("selectpage").data("source", "auth/admin/index").data("primaryKey", "username").data("field", "username").data("orderBy", "id desc");
                Form.events.cxselect(form);
                Form.events.selectpage(form);
            });

            //在表格内容渲染完成后回调的事件
            table.on('post-body.bs.table', function (e, settings, json, xhr) {
                console.log(e, settings, json, xhr);
            });

            //当表格数据加载完成时
            table.on('load-success.bs.table', function (e, data) {
                //这里可以获取从服务端获取的JSON数据
                console.log(data);
            });

            // 初始化表格
            // 这里使用的是Bootstrap-table插件渲染表格
            // 相关文档：http://bootstrap-table.wenzhixin.net.cn/zh-cn/documentation/
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                columns: [
                    [
                        //这里两列colspan的值加起来必须等级下方字段的总数量
                        {title: '标题一', colspan: 5},
                        {title: '标题二', colspan: 6},
                        //我们向操作栏额外添加上一个详情按钮,并保留已有的编辑和删除控制
                        {field: 'operate', width: "120px", rowspan: 2, title: __('Operate'), table: table, events: Table.api.events.operate,
                            buttons: [
                                {name: 'detail', title: __('弹出窗口打开'), classname: 'btn btn-xs btn-primary btn-dialog', icon: 'fa fa-list', url: 'example/bootstraptable/detail', callback: function (data) {
                                        Layer.alert("接收到回传数据：" + JSON.stringify(data), {title: "回传数据"});
                                    }},
                                {name: 'ajax', title: __('发送Ajax'), classname: 'btn btn-xs btn-success btn-magic btn-ajax', icon: 'fa fa-magic', url: 'example/bootstraptable/detail',
                                    success: function (data, ret) {
                                        Layer.alert(ret.msg + ",返回数据：" + JSON.stringify(data));
                                        //如果需要阻止成功提示，则必须使用return false;
                                        //return false;
                                    }, error: function (data, ret) {
                                        console.log(data, ret);
                                        Layer.alert(ret.msg);
                                        return false;
                                    }
                                },
                                {name: 'addtabs', title: __('新选项卡中打开'), classname: 'btn btn-xs btn-warning btn-addtabs', icon: 'fa fa-folder-o', url: 'example/bootstraptable/detail'}
                            ],
                            formatter: Table.api.formatter.operate
                        },
                    ],
                    [
                        //如果表格页头只需要一行，这里只需要配置一个数组即可
                        //更多配置参数可参考http://bootstrap-table.wenzhixin.net.cn/zh-cn/documentation/#c
                        //该列为复选框字段,如果后台的返回state值将会默认选中
                        {field: 'state', checkbox: true, },
                        {field: 'id', title: 'ID', sortable: true, operate: false},
                        //默认隐藏该列
                        {field: 'admin_id', title: __('管理员'), operate: false},
                        //直接响应搜索
                        {field: 'username', title: __('管理员'), formatter: Table.api.formatter.search},
                        //模糊搜索
                        {field: 'id', title: __('Title'), operate: 'LIKE %...%', placeholder: '模糊搜索，*表示任意字符'},
                        //通过Ajax渲染searchList，也可以使用JSON数据
                        {field: 'url', title: __('Url'), align: 'left', searchList: $.getJSON('example/bootstraptable/searchlist?search=a&field=row[user_id]'), formatter: Controller.api.formatter.url},
                        //点击IP时同时执行搜索此IP
                        {field: 'ip', title: __('IP'), events: Controller.api.events.ip, formatter: Controller.api.formatter.ip},
                        //自定义栏位
                        {field: 'custom', title: __('切换'), operate: false, formatter: Controller.api.formatter.custom},
                        //browser是一个不存在的字段
                        //通过formatter来渲染数据,同时为它添加上事件
                        {field: 'browser', title: __('Browser'), operate: false, events: Controller.api.events.browser, formatter: Controller.api.formatter.browser},
                        {field: 'admin_id', title: __('联动搜索'), searchList: function (column) {
                                return Template('categorytpl', {});
                            }
                        },
                        //启用时间段搜索
                        {field: 'createtime', title: __('Update time'), sortable: true, formatter: Table.api.formatter.datetime, operate: 'RANGE', addclass: 'datetimerange'},
                    ],
                ],
                //更多配置参数可参考http://bootstrap-table.wenzhixin.net.cn/zh-cn/documentation/#t
                //亦可以参考require-table.js中defaults的配置
                //禁用默认搜索
                search: false,
                //启用普通表单搜索
                commonSearch: true,
                //可以控制是否默认显示搜索单表,false则隐藏,默认为false
                searchFormVisible: true,
                queryParams: function (params) {
                    //这里可以追加搜索条件
//                    var filter = JSON.parse(params.filter);
//                    var op = JSON.parse(params.op);
//                    filter.admin_id = 1;
//                    op.admin_id = "=";
//                    params.filter = JSON.stringify(filter);
//                    params.op = JSON.stringify(op);
                    return params;
                },
            });

            // 为表格绑定事件
            Table.api.bindevent(table);

            // 监听下拉列表改变的事件
            $(document).on('change', 'select[name=admin]', function () {
                $("input[name='admin_id']").val($(this).val());
            });

            // 指定搜索条件
            $(document).on("click", ".btn-singlesearch", function () {
                var options = table.bootstrapTable('getOptions');
                options.pageNumber = 1;
                options.queryParams = function (params) {
                    params.filter = JSON.stringify({url: 'login'});
                    params.op = JSON.stringify({url: 'like'});
                    return params;
                };
                table.bootstrapTable('refresh', {});
                Toastr.info("当前执行的是自定义搜索,搜索URL中包含login的数据");
                return false;
            });

            // 获取选中项
            $(document).on("click", ".btn-selected", function () {
                Layer.alert(JSON.stringify(table.bootstrapTable('getSelections')));
            });

            // 启动和暂停按钮
            $(document).on("click", ".btn-start,.btn-pause", function () {
                //在table外不可以使用添加.btn-change的方法
                //只能自己调用Table.api.multi实现
                //如果操作全部则ids可以置为空
                var ids = Table.api.selectedids(table);
                Table.api.multi("changestatus", ids.join(","), table, this);
            });

        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        detail: function () {
            $(document).on('click', '.btn-callback', function () {
                Fast.api.close($("input[name=callback]").val());
            });
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },
            formatter: {//渲染的方法
                url: function (value, row, index) {
                    return '<div class="input-group input-group-sm" style="width:250px;"><input type="text" class="form-control input-sm" value="' + value + '"><span class="input-group-btn input-group-sm"><a href="' + value + '" target="_blank" class="btn btn-default btn-sm"><i class="fa fa-link"></i></a></span></div>';
                },
                ip: function (value, row, index) {
                    return '<a class="btn btn-xs btn-ip bg-success"><i class="fa fa-map-marker"></i> ' + value + '</a>';
                },
                browser: function (value, row, index) {
                    //这里我们直接使用row的数据
                    return '<a class="btn btn-xs btn-browser">' + row.useragent.split(" ")[0] + '</a>';
                },
                custom: function (value, row, index) {
                    //添加上btn-change可以自定义请求的URL进行数据处理
                    return '<a class="btn-change text-success" data-url="example/bootstraptable/change" data-id="' + row.id + '"><i class="fa ' + (row.title == '' ? 'fa-toggle-off' : 'fa-toggle-on') + ' fa-2x"></i></a>';
                },
            },
            events: {//绑定事件的方法
                ip: {
                    //格式为：方法名+空格+DOM元素
                    'click .btn-ip': function (e, value, row, index) {
                        e.stopPropagation();
                        console.log();
                        var container = $("#table").data("bootstrap.table").$container;
                        var options = $("#table").bootstrapTable('getOptions');
                        //这里我们手动将数据填充到表单然后提交
                        $("form.form-commonsearch [name='ip']", container).val(value);
                        $("form.form-commonsearch", container).trigger('submit');
                        Toastr.info("执行了自定义搜索操作");
                    }
                },
                browser: {
                    'click .btn-browser': function (e, value, row, index) {
                        e.stopPropagation();
                        Layer.alert("该行数据为: <code>" + JSON.stringify(row) + "</code>");
                    }
                },
            }
        }
    };
    return Controller;
});