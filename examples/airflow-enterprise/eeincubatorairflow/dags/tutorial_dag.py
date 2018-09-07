from airflow import utils
from airflow import DAG
from airflow.operators.bash_operator import BashOperator
from airflow.operators.python_operator import PythonOperator
from airflow.operators.python_operator import ShortCircuitOperator
from airflow.operators.python_operator import BranchPythonOperator
from airflow.operators.http_operator import SimpleHttpOperator

from airflow.operators.sensors import HttpSensor
from airflow.operators.sensors import TimeSensor
from airflow.operators.sensors import TimeDeltaSensor

from datetime import datetime, timedelta
import json
import logging

import helloworld

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': utils.dates.days_ago(2),
}

dag = DAG('example_tutorial_dag', schedule_interval='@daily', default_args=default_args)

t1 = BashOperator(
        task_id='sleep5seconds',
        bash_command='sleep 5',
        dag=dag)

t2 = BashOperator(
        task_id='echoHey',
        bash_command='echo hey',
        dag=dag)

t3 = BashOperator(
        task_id='sleep3seconds',
        bash_command='sleep 3',
        dag=dag)

t4 = PythonOperator(
        task_id='helloworld',
        python_callable=helloworld.main,
        dag=dag)

t5 = ShortCircuitOperator(
        task_id='shortCircuitFalse',
        python_callable = lambda : False,
        dag=dag)

t6 = BashOperator(
        task_id='shouldNotEchoHey',
        bash_command='echo hey',
        dag=dag)

t7 = BranchPythonOperator(
        task_id='evaluateBranch',
        python_callable = lambda : 'ifTrueEchoHey' if True else 'sleep3seconds',
        dag=dag)

t8 = BashOperator(
        task_id='ifTrueEchoHey',
        bash_command='echo hey',
        dag=dag)

t9 = SimpleHttpOperator(
        task_id='getDogPicture',
        method='GET',
        http_conn_id='http_dog',
        endpoint='api/breeds/image/random',
        headers={"Content-Type": "application/json"},
        xcom_push=True,
        dag=dag)

t10 = HttpSensor(
        task_id='http_sensor',
        http_conn_id='example',
        endpoint='',
        request_params={},
        response_check= lambda response: True if "example" in response.content else False,
        dag=dag)



t1.set_downstream(t2)
t2.set_downstream(t7)

t7.set_downstream(t3)
t3.set_downstream(t4)

t7.set_downstream(t8)
t8.set_downstream(t9)
t9.set_downstream(t10)

t1.set_downstream(t5)
t5.set_downstream(t6)
