<template>
    <div id="app">
        <div id="mobile-nav" class="ui fixed inverted main menu">
            <div class="ui container">
                <a class="launch icon item">
                    <i class="content icon"></i>
                </a>

                <div class="right menu">
                    <a href="" class="vertically fitted borderless item">
                        <i class="power icon"></i>
                    </a>
                </div>
            </div>
        </div>

        <div id="sidebar">
            <div class="ui vertical inverted sticky menu sidebar-menu">
                <div class="item">
                    <div class="header">
                        PXL Web Vagrant
                    </div>
                </div>

                <div class="item">
                    <div class="header">
                        Dashboard
                    </div>

                    <div class="menu">
                        <router-link :to="{ name: 'projects' }" class="item">
                            Projects
                        </router-link>
                    </div>
                </div>

                <div class="item">
                    <div class="header">
                        Web Servers
                    </div>

                    <div class="menu">
                        <router-link :to="{ name: 'projects' }" class="item">
                            Apache
                        </router-link>

                        <router-link :to="{ name: 'modules' }" class="item">
                            NGINX
                        </router-link>
                    </div>
                </div>

                <div class="item">
                    <div class="header">
                        Databases
                    </div>

                    <div class="menu">
                        <router-link :to="{ name: 'projects' }" class="item">
                            MySQL
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div id="page">
            <div id="page-container">
                <!-- <div class="ui small breadcrumb">
                    <a class="section">Home</a>
                    <i class="right chevron icon divider"></i>
                    <div class="active section">Personal Information</div>
                </div> -->

                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
    const DEFAULT_LAYOUT = 'auth';

    export default {
        computed: {
            currentLayout () {
                return `${this.$route.meta.layout || DEFAULT_LAYOUT}-layout`;
            }
        }
    };
</script>

<style lang="scss">
    @import 'styles/mobile';
    @import 'styles/desktop';

    html,
    body,
    #app,
    .layout {
        height: 100%;
    }

    #app {
        &[v-cloak] {
            display: none;
        }
    }
</style>
