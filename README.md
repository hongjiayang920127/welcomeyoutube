# 超级马里奥（迷你网页版）

这是一个纯 HTML/CSS/JavaScript 开发的迷你版超级马里奥游戏，无需安装依赖即可运行。

## 一、先确认你在正确目录

先执行下面命令（必须看到 `index.html`）：

```bash
cd /workspace/welcomeyoutube
ls
```

如果看不到 `index.html`，说明你不在游戏目录里。

---

## 二、如何打开游戏（推荐方法）

### 1）启动本地静态服务器

```bash
cd /workspace/welcomeyoutube
python3 -m http.server 8000
```

看到类似输出表示启动成功：

```text
Serving HTTP on 0.0.0.0 port 8000
```

### 2）在浏览器打开

访问：

- `http://localhost:8000/index.html`（最稳妥，推荐）

> 注意：你如果只打开 `http://localhost:8000/`，在某些环境可能会出现你截图中的 `Not Found`，所以请直接加上 `/index.html`。

---

## 三、如果你还是看到 Not Found（按顺序排查）

1. 你是否在正确目录启动服务：
   ```bash
   pwd
   ```
   应该是：`/workspace/welcomeyoutube`

2. 文件是否存在：
   ```bash
   ls /workspace/welcomeyoutube/index.html
   ```

3. 端口是否一致（你启动的是 8000，就访问 8000）：
   ```bash
   curl -I http://localhost:8000/index.html
   ```
   如果是 `HTTP/1.0 200 OK` 或 `HTTP/1.1 200 OK` 就正常。

4. 如果 8000 被占用，换个端口：
   ```bash
   python3 -m http.server 8080
   ```
   然后访问 `http://localhost:8080/index.html`。

---

## 四、操作说明

- `←` / `→`：左右移动
- `空格` / `↑`：跳跃
- `R`：重新开始

## 五、快速测试清单（你可以这样验收）

- 能打开页面并看到“超级马里奥 · 迷你版”标题
- 左右键可移动
- 空格可跳跃，且有重力下落
- 吃到金币分数增加（+100）
- 踩到敌人分数增加（+200）
- 碰到敌人（非踩踏）游戏失败
- 到达终点旗帜显示胜利
- 按 `R` 可以重开

祝你玩得开心！
