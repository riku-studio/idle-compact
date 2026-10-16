# idle-compact

Claude Code / Claude 桌面版的 mod：会话空闲接近 1 小时提示缓存过期时（默认 58 分钟），自动执行 `/compact`，下次回来只需重新加载一段摘要，而不是整段上下文。

- 主对话每结束一轮开始倒计时；有新一轮开始就取消，结束后重新计时。
- 上下文小于阈值（默认 30000 tokens）时跳过。
- 每次空闲只压缩一次；手动 `/compact` 或自动压缩过后也会取消倒计时。
- 压缩完成后弹提示，显示压缩前后 token 数和压缩本身的用量。

## 安装

从 GitHub（`<owner>/<repo>` 换成实际仓库）：

```bash
claude plugin install idle-compact --marketplace <owner>/<repo>
```

或在 Claude Code 终端会话里输入：`/plugin install idle-compact --marketplace <owner>/<repo>`

从 git 地址或本地文件夹：

```bash
claude plugin marketplace add <git 地址或文件夹路径>
```

```bash
claude plugin install idle-compact@idle-compact-local
```

在桌面版里：点输入框旁的 +，选 Plugins → Add marketplace，填仓库或路径，然后 Add plugin。

## 设置

| 选项 | 默认 | 说明 |
| --- | --- | --- |
| `idleMinutes` | 58 | 最后一轮结束后多少分钟压缩，应小于 60 |
| `minTokens` | 30000 | 上下文小于该值时不压缩 |
| `instructions` | 空 | 传给压缩的摘要指令，相当于 `/compact` 后面的文字 |

例如：`claude plugin install idle-compact@idle-compact-local --config idleMinutes=55`

## 注意

- 压缩本身会读一遍整段上下文（缓存读取价）并生成摘要；如果之后不再回到这个会话，这部分花费就白花了。
- 压缩会丢失细节。
- 计时器跑在会话进程里，关闭应用或会话进程停止后不会触发。

## 测试

```bash
claude plugin test .
```
