# DKC

本项目是进行k8s离线安装的管理工具

#### Feature
- [x] 基础环境k8s/mongo安装
  - [x] 下载离线文件
  - [x] 在浏览器编辑拓扑文件
  - [x] 支持通过ansible在目标服务器安装k8s, 前提:目标服务器系统是centos7
  - [x] 检查已安装的k8s运行状态


```shell script
$ ./dkc
kubernetes 离线安装助手

Usage:
  ./dkc [command]

Available Commands:
  completion  generate the autocompletion script for the specified shell
  download    下载离线文件, 包括docker/ansible/k8s相关安装包
  help        Help about any command
  install     默认使用本地ansible 2.9.18安装k8s
  node        增/删k8s node节点
  prepare     检测部署环境信息
  status      检查k8s集群状态
  uninstall   默认使用本地ansible 2.9.18删除k8s集群

Flags:
      --debug                   show debug logs
  -h, --help                    help for ./dkc/dkc
  -i, --inventory-file string   拓扑文件hosts.yaml (default "inventory/hosts.yaml")
  -v, --version                 version for ./dkc/dkc
  -y, --yes                     exec command without ask

Use "./dkc [command] --help" for more information about a command.
```
