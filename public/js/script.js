$(document).ready(function(){
  var socket = io();

  // prevent scroll of parent
  $('.todo__content').on( 'mousewheel DOMMouseScroll', function (e) {

    var e0 = e.originalEvent;
    var delta = e0.wheelDelta || -e0.detail;

    this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
    e.preventDefault();
  });

  // redirect when click btns
  $(".todo__add-btn").click(function(){
    window.location.href = "/add";
  })

  $(".completed-btn").click(function(){
    window.location.href = "/completed";
  })

  $(".list-btn").click(function(){
    window.location.href = "/";
  })

  // toggle between completed and uncompleted
  $('.todo__toggle').on('change', function(){
    var todoId = $(this).attr('id');
    var checked = !$(this).attr('checked');
    removeTodoCat($(this));
    socket.emit('change completed status', {id: todoId, checked: checked});
  })

  // delete todo item
  $('.todo__delete-btn').click(function(){
    var todoId = $(this).attr('data-todo-id');
    removeTodoCat($(this));
    socket.emit('delete todo', {id: todoId});
  })

  // remove all completed todos
  $('.completed__trash-btn').click(function(){
    $('.todo__subcontent').fadeOut('', function(){
      $(this).remove();
      createNoTaskScreen();
    })
    socket.emit('delete all completed');
  })

  // submit new todo
  $('.send-btn').click(function(){
    var newTodo = $('.todo__textarea').val();
    socket.emit('add new todo', {content: newTodo});
  })

  // remove todo item
  // remove todo category if no todo left under its category
  // show no-task screen if no todo left
  function removeTodoCat(item){
    var todoList = item.closest('.todo__list');
    item.parent().hide('', function(){
      item.parent().remove();
      if(!todoList.children().length){
        todoList.parent().remove();
      }
      if(!$('.todo__content').children().length){
        createNoTaskScreen();
      }
    })
  }

  // create no-task screen
  function createNoTaskScreen(){
    if(!$('.todo__content').children().length){
      var noTask = $('<div class="text--center msg-screen"><img src="images/no-task.png" class="msg-screen__img"><p>No Tasks</p></div>');
      $('.todo__content').append(noTask);
    }
  }
})
