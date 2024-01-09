<template>
    <div class="container">
        <!-- <van-cell title="版本更新2" @click="versionUpdate" is-link>
            <template #default>
                {{ cloudVersion === localVersion ? '已是最新版本！' : '有新版本,点击更新~' }}
            </template>
        </van-cell> -->
        <slot></slot>
        <!-- 版本更新弹窗 -->
        <van-popup v-model="showUpadte" :close-on-click-overlay="false">
            <div class="progress_wrapper">
                <div class="top_wrapper">
                    <div class="title">当前有新版本</div>
                    <div class="version">
                        V{{ cloudVersion }}
                    </div>
                </div>
                <svg t="1695717514748" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="5857" width="100" height="100"
                     style="margin: 10px auto;" v-if="type == 1">
                    <path d="M791.488 544.095c-1.28-129.695 105.76-191.871 110.528-194.975-60.16-88.032-153.856-100.064-187.232-101.472-79.744-8.064-155.584 46.944-196.064 46.944-40.352 0-102.816-45.76-168.96-44.544-86.912 1.28-167.072 50.528-211.808 128.384-90.304 156.703-23.136 388.831 64.896 515.935 43.008 62.208 94.304 132.064 161.632 129.568 64.832-2.592 89.376-41.952 167.744-41.952s100.416 41.952 169.056 40.672c69.76-1.312 113.984-63.392 156.704-125.792 49.376-72.16 69.728-142.048 70.912-145.632-1.536-0.704-136.064-52.224-137.408-207.136zM662.56 163.52C698.304 120.16 722.432 60 715.84 0c-51.488 2.112-113.888 34.304-150.816 77.536-33.152 38.368-62.144 99.616-54.368 158.432 57.472 4.48 116.128-29.216 151.904-72.448z"
                          p-id="5858"></path>
                </svg>
                <van-button @click="updateApp" v-if="!isDownloading"
                            color="linear-gradient(to right, #1989fa, #4f667c)">点击更新</van-button>
                <div v-if="isDownloading">
                    <van-progress :percentage="progress"
                                  color="linear-gradient(to right, #1989fa, #4f667c)"
                                  stroke-width="12" />
                    <div class="remark">正在下载安装包{{ progress }}%</div>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<script>
import { Toast } from "vant";
export default {
    components: {},
    props: {},
    data() {
        return {
            localVersion: "1.0.0",
            cloudVersion: "1.0.0",
            showUpadte: false,
            isDownloading: false, // 是否正在下载
            progress: 0,
            needUpdate: false,
            type: null,
            isForce: null, // 是否强制更新,0为非强制更新，1为强制更新。
        };
    },
    computed: {},
    watch: {},
    created() {
        this.$plusExtends(async () => {
            this.localVersion = window.plus.runtime.version; // 获取本地版本号
            this.type = window.plus.os.name == "Android" ? 2 : 1; // 获取设备类型，安卓为2，iOS为1。
            await this.getVersion().catch((err) => err); // 获取云端版本号和最新版下载地址，以及是否属于强制更新
            this.diffVersion(this.localVersion, this.cloudVersion); // 比较本地和云端的版本号，判断是否需要更新
            // 如果需要更新，且为强制更新，则直接弹出更新确认框
            if (this.needUpdate && this.isForce == 1) {
                this.showUpadte = true;
            }
        });
    },
    mounted() {},
    methods: {
        // 点击版本更新
        versionUpdate() {
            if (this.needUpdate) {
                this.showUpadte = true;
            } else {
                Toast("已是最新版本！");
            }
        },
        // 获取云端版本号以及双端下载地址，以及是否属于强制更新
        async getVersion() {
            try {
                const { data: res } = await this.axios.post(
                    "manage-service/versioncontroller/findAllController",
                    {
                        type: this.type,
                        page: 1,
                        size: 99,
                        projectType: 7,
                    }
                );

                if (res.result === 1) {
                    this.cloudVersion = res.list[0].version;
                    this.isForce = res.list[0].isForce;
                    if (this.type == 2) {
                        this.anUrl = res.list[0].androidUrl;
                    } else if (this.type == 1) {
                        this.iosUrl = res.list[0].iosUrl;
                    }
                }
            } catch (err) {
                console.log("error", err);
                Toast("获取云端版本失败！");
            }
        },
        //比较版本号大小
        diffVersion(localV, cloudV) {
            let localvArr = localV.split(".");
            let cloudvArr = cloudV.split(".");
            if (localvArr[0] < cloudvArr[0]) {
                this.needUpdate = true;
            } else if (localvArr[0] == cloudvArr[0]) {
                if (localvArr[1] < cloudvArr[1]) {
                    this.needUpdate = true;
                } else if (localvArr[1] == cloudvArr[1]) {
                    if (localvArr[2] < cloudvArr[2]) {
                        this.needUpdate = true;
                    }
                }
            }
        },
        // 启动下载，更新安装
        updateApp() {
            if (this.type == 2) {
                this.isDownloading = true;
            }
            this.$plusExtends(() => {
                if (this.type === 2) {
                    this.showUpadte = true;
                    const savePath = "_downloads/app.apk";
                    const downloadTask = window.plus.downloader.createDownload(
                        this.anUrl,
                        { filename: savePath },
                        (download, status) => {
                            if (status === 200) {
                                window.plus.runtime.install(
                                    download.filename,
                                    { force: true },
                                    () => {
                                        window.plus.runtime.restart();
                                    }
                                );
                            } else {
                                console.log("下载失败");
                                this.showUpadte = false;
                            }
                        }
                    );
                    downloadTask.addEventListener("statechanged", (task) => {
                        if (task.state === 3) {
                            const progress = Math.round(
                                (task.downloadedSize / task.totalSize) * 100
                            );
                            this.progress = progress;
                            if (this.progress == 100) {
                                this.showUpadte = false;
                            }
                        }
                    });
                    downloadTask.start();
                } else {
                    plus.runtime.openURL(this.iosUrl);
                }
            });
        },
    },
};
</script>

<style scoped lang="less">
.container {
    .progress_wrapper {
        width: 80vw;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;

        .van-button {
            width: 90%;
            margin: 20px auto 20px auto;
        }

        .top_wrapper {
            background-color: #1989fa;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            padding: 10px 0;
            margin-bottom: 20px;

            .title {
                font-size: 18px;
                margin-bottom: 12px;
            }

            .version {
                background-color: #ffad2c;
                color: #fff;
                padding: 4px;
                border-radius: 4px;
            }
        }

        .van-progress {
            width: 90%;
            margin: 10px auto;
        }

        .remark {
            color: #999;
            text-align: center;
            margin-bottom: 40px;
        }
    }
}
</style>
