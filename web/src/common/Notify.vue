<template>
    <div>
        <div v-if="isDialogVisible" class="dialog">
            <p>{{ message }}</p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isDialogVisible: false
        };
    },
    methods: {
        showDialog() {
            this.isDialogVisible = true;
            setTimeout(() => {
            this.hideDialog();
            }, 1000);
        },
        hideDialog() {
            // Hide the dialog box
            this.isDialogVisible = false;
        },

    },
    created() {
        this.showDialog();
    },
    props: {
        success: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: ''
        }
    }
};
</script>

<style>
    .dialog {
        position: fixed;
        top: 20px; /* Adjust the top position as needed */
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: #fff;
        padding: 10px 20px;
        border-radius: 5px;
        display: inline-block;
    }
</style>